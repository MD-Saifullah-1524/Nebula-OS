import { Extension } from "../../LiOS-Open/modules/JS/ui";
import { nodeMethods } from "../../LiOS-Open/modules/JS/ui/nodeMethods";
import { widgetController } from "../modules/storageModule.ts";

export type WidgetOptions = {
    colSpan?: number; // e.g. 1, 2, 4 (default: 2)
    rowSpan?: number; // e.g. 1, 2, 4 (default: 2)
    col?: number;     // optional specific column start
    row?: number;     // optional specific row start
    id?: string;
};

export type Widget = nodeMethods & {
    widgetId: string;
    colSpan: number;
    rowSpan: number;
    col?: number;
    row?: number;
    setSize(colSpan: number, rowSpan: number): Widget;
    setPosition(col: number, row: number): Widget;
    removeWidget(): void;
};

export type Desktop = nodeMethods & {
    widget(colSpanOrOptions?: number | WidgetOptions, rowSpan?: number): Widget;
    setEditMode(enabled: boolean): void;
    isEditMode(): boolean;
    getWidgets(): Widget[];
    readonly totalWidth: number;
    readonly totalHeight: number;
    readonly totalColumns: number;
    readonly totalColumn: number;
    readonly totalRows: number;
    readonly totalRow: number;
    readonly width: number;
    readonly height: number;
    readonly columns: number;
    readonly rows: number;
};

declare module "../../LiOS-Open/modules/JS/ui" {
    interface ui {
        desktop(): Desktop;
    }
}

const WIDGET_SIZES = [
    { colSpan: 1, rowSpan: 1 },
    { colSpan: 2, rowSpan: 1 },
    { colSpan: 2, rowSpan: 2 },
    { colSpan: 4, rowSpan: 2 },
    { colSpan: 4, rowSpan: 4 }
];

const GRID_CONFIG = {
    padding: 24,
    gap: 16,
    cellWidth: 130,
    cellHeight: 130
};

export const desktop: Extension<(this: nodeMethods) => Desktop> = {
    method: function (this: nodeMethods): Desktop {
        const desktop = this.child("div") as unknown as Desktop;
        desktop.class.add("lios-desktop");

        // 1. Inject Jiggle Animation and Edit-Mode Rules via LiOS child node
        const styleNode = desktop.child("style");
        styleNode.id("lios-desktop-styles");
        styleNode.text(`
            @keyframes lios-widget-jiggle {
                0% { transform: rotate(-0.6deg) scale(0.99); }
                50% { transform: rotate(0.6deg) scale(1.01); }
                100% { transform: rotate(-0.6deg) scale(0.99); }
            }

            .lios-desktop-edit-mode .lios-widget {
                animation: lios-widget-jiggle 0.3s infinite ease-in-out alternate;
                cursor: grab !important;
                touch-action: none;
            }

            .lios-desktop-edit-mode .lios-widget:active {
                cursor: grabbing !important;
            }

            .lios-widget {
                position: relative;
            }

            .lios-widget-controls {
                display: none;
                pointer-events: auto;
            }

            .lios-desktop-edit-mode .lios-widget-controls {
                display: flex;
            }

            .lios-desktop-edit-mode .lios-desktop-done-btn {
                display: block !important;
            }
        `);

        // 2. Desktop Grid Container Styles
        desktop.style().set({
            boxSizing: "border-box",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gridAutoRows: "130px",
            gridAutoFlow: "dense",
            gap: "16px",
            padding: "24px",
            paddingBottom: "110px", // Clearance for dock
            width: "100vw",
            height: "100vh",
            position: "fixed",
            inset: "0",
            zIndex: "0",
            overflow:"none"
        });

        // 3. Grid Drop Placeholder (visual target where the widget will land)
        const placeholder = desktop.child("div");
        placeholder.class.add("lios-grid-placeholder");
        placeholder.style().set({
            display: "none",
            borderRadius: "24px",
            border: "2px dashed rgba(255, 255, 255, 0.4)",
            background: "rgba(255, 255, 255, 0.08)",
            boxSizing: "border-box",
            pointerEvents: "none",
            transition: "all 0.12s ease-out"
        });

        // 4. Floating "Done" button to exit Edit Mode
        const doneButton = desktop.child("button");
        doneButton.class.add("lios-desktop-done-btn");
        doneButton.text("Done Editing ✓");
        doneButton.style().set({
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            backdropFilter: "blur(12px)",
            webkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            padding: "8px 20px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            zIndex: "999",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
            display: "none",
            transition: "transform 0.15s ease, background 0.15s ease"
        });
        doneButton.style(":hover").set({
            transform: "translateX(-50%) scale(1.05)",
            background: "rgba(0, 0, 0, 0.85)"
        });
        doneButton.on("click", (e: MouseEvent) => {
            e.stopPropagation();
            desktop.setEditMode(false);
        });

        // Edit Mode State & Methods
        let editMode = false;
        const widgets: Widget[] = [];

        desktop.isEditMode = () => editMode;

        desktop.setEditMode = (enabled: boolean) => {
            editMode = enabled;
            if (editMode) {
                desktop.class.add("lios-desktop-edit-mode");
            } else {
                desktop.class.remove("lios-desktop-edit-mode");
            }
        };

        desktop.getWidgets = () => widgets;

        // Getters for total width and total columns
        Object.defineProperty(desktop, "totalWidth", {
            get(): number {
                return desktop.getElement().getBoundingClientRect().width;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(desktop, "width", {
            get(): number {
                return (desktop as any).totalWidth;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(desktop, "totalColumns", {
            get(): number {
                const el = desktop.getElement();
                const computed = window.getComputedStyle(el);
                const tracks = computed.gridTemplateColumns.split(" ").filter(Boolean);
                if (tracks.length > 0) return tracks.length;

                const availWidth = el.getBoundingClientRect().width - GRID_CONFIG.padding * 2;
                const colStep = GRID_CONFIG.cellWidth + GRID_CONFIG.gap;
                return Math.max(1, Math.floor((availWidth + GRID_CONFIG.gap) / colStep));
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(desktop, "totalColumn", {
            get(): number {
                return (desktop as any).totalColumns;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(desktop, "columns", {
            get(): number {
                return (desktop as any).totalColumns;
            },
            enumerable: true,
            configurable: true
        });

        // Getters for total height and total rows
        Object.defineProperty(desktop, "totalHeight", {
            get(): number {
                return desktop.getElement().getBoundingClientRect().height;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(desktop, "height", {
            get(): number {
                return (desktop as any).totalHeight;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(desktop, "totalRows", {
            get(): number {
                const el = desktop.getElement();
                // 110px dock clearance + 24px top padding
                const availHeight = el.getBoundingClientRect().height - GRID_CONFIG.padding - 110;
                const rowStep = GRID_CONFIG.cellHeight + GRID_CONFIG.gap;
                const visibleRows = Math.max(1, Math.floor((availHeight + GRID_CONFIG.gap) / rowStep));

                // Also check if any placed widget extends beyond visible rows
                const maxOccupiedRow = widgets.reduce((max, w) => {
                    const rowEnd = (w.row || 1) + w.rowSpan - 1;
                    return Math.max(max, rowEnd);
                }, visibleRows);

                return Math.max(visibleRows, maxOccupiedRow);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(desktop, "totalRow", {
            get(): number {
                return (desktop as any).totalRows;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(desktop, "rows", {
            get(): number {
                return (desktop as any).totalRows;
            },
            enumerable: true,
            configurable: true
        });

        // Desktop Events
        desktop.on("click", (e: MouseEvent) => {
            if (editMode && e.target === desktop.getElement()) {
                desktop.setEditMode(false);
            }
        });

        desktop.on("contextmenu", (e: MouseEvent) => {
            if (e.target === desktop.getElement()) {
                e.preventDefault();
                desktop.setEditMode(!editMode);
            }
        });

        window.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Escape" && editMode) {
                desktop.setEditMode(false);
            }
        });

        // Helper to calculate target grid cell from pointer coordinates
        function calculateGridCell(clientX: number, clientY: number, widgetSpanCols: number): { col: number; row: number } {
            const desktopEl = desktop.getElement();
            const rect = desktopEl.getBoundingClientRect();
            const computed = window.getComputedStyle(desktopEl);
            const paddingLeft = parseFloat(computed.paddingLeft) || 24;
            const paddingTop = parseFloat(computed.paddingTop) || 24;
            const gap = parseFloat(computed.gap) || 16;

            const colTracks = computed.gridTemplateColumns.split(" ").filter(Boolean);
            const colCount = Math.max(1, colTracks.length);
            const colWidth = parseFloat(colTracks[0]) || 130;
            const rowHeight = 130;

            const relX = clientX - rect.left - paddingLeft;
            const relY = clientY - rect.top - paddingTop + desktopEl.scrollTop;

            const rawCol = Math.floor(relX / (colWidth + gap)) + 1;
            const rawRow = Math.floor(relY / (rowHeight + gap)) + 1;

            const col = Math.max(1, Math.min(colCount - widgetSpanCols + 1, rawCol));
            const row = Math.max(1, rawRow);

            return { col, row };
        }

        // Add Widget Method
        desktop.widget = (colSpanOrOptions = 2, rowSpan = 2): Widget => {
            let cols = 2;
            let rows = 2;
            let colStart: number | undefined;
            let rowStart: number | undefined;
            let id = `widget-${crypto.randomUUID().slice(0, 8)}`;

            if (typeof colSpanOrOptions === "object") {
                cols = colSpanOrOptions.colSpan ?? 2;
                rows = colSpanOrOptions.rowSpan ?? 2;
                colStart = colSpanOrOptions.col;
                rowStart = colSpanOrOptions.row;
                if (colSpanOrOptions.id) id = colSpanOrOptions.id;
            } else if (typeof colSpanOrOptions === "number") {
                cols = colSpanOrOptions;
                rows = rowSpan;
            }

            const widget = desktop.child("div") as unknown as Widget;
            widget.class.add("lios-widget");

            widget.widgetId = id;
            widget.id(id);
            widget.colSpan = cols;
            widget.rowSpan = rows;
            widget.col = colStart;
            widget.row = rowStart;

            const applyGridPosition = () => {
                const colStyle = widget.col ? `${widget.col} / span ${widget.colSpan}` : `span ${widget.colSpan}`;
                const rowStyle = widget.row ? `${widget.row} / span ${widget.rowSpan}` : `span ${widget.rowSpan}`;

                widget.style().set({
                    gridColumn: colStyle,
                    gridRow: rowStyle
                });

                const el = widget.getElement();
                if (el) {
                    el.style.gridColumn = colStyle;
                    el.style.gridRow = rowStyle;
                }
            };
            applyGridPosition();

            widget.style().set({
                background: "var(--frosted-white, rgba(255, 255, 255, 0.15))",
                backdropFilter: "blur(20px)",
                webkitBackdropFilter: "blur(20px)",
                borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
                padding: "16px",
                boxSizing: "border-box",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
                userSelect: "none"
            });

            // 5. Widget Controls Container using LiOS child nodes
            const controls = widget.child("div");
            controls.class.add("lios-widget-controls");

            // Delete Badge (×)
            const deleteBtn = controls.child("div");
            deleteBtn.class.add("lios-widget-badge", "lios-widget-delete-badge");
            deleteBtn.text("×");
            deleteBtn.attr({ title: "Delete Widget" });
            deleteBtn.style().set({
                position: "absolute",
                top: "-10px",
                left: "-10px",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#ff3b30",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                zIndex: "20",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                border: "2px solid white",
                transition: "transform 0.15s ease",
                userSelect: "none"
            });
            deleteBtn.style(":hover").set({
                transform: "scale(1.15)"
            });
            deleteBtn.on("click", (e: MouseEvent) => {
                e.stopPropagation();
                widget.removeWidget();
            });

            // Resize Badge (⤢)
            // const resizeBtn = controls.child("div");
            // resizeBtn.class.add("lios-widget-badge", "lios-widget-resize-badge");
            // resizeBtn.text("⤢");
            // resizeBtn.attr({ title: "Cycle Size" });
            // resizeBtn.style().set({
            //     position: "absolute",
            //     bottom: "-10px",
            //     right: "-10px",
            //     width: "28px",
            //     height: "28px",
            //     borderRadius: "50%",
            //     background: "#007aff",
            //     color: "white",
            //     display: "flex",
            //     alignItems: "center",
            //     justifyContent: "center",
            //     cursor: "pointer",
            //     fontSize: "14px",
            //     fontWeight: "bold",
            //     zIndex: "20",
            //     boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            //     border: "2px solid white",
            //     transition: "transform 0.15s ease",
            //     userSelect: "none"
            // });
            // resizeBtn.style(":hover").set({
            //     transform: "scale(1.15)"
            // });
            // resizeBtn.on("click", (e: MouseEvent) => {
            //     e.stopPropagation();
            //     const currentIndex = WIDGET_SIZES.findIndex(
            //         s => s.colSpan === widget.colSpan && s.rowSpan === widget.rowSpan
            //     );
            //     const nextSize = WIDGET_SIZES[(currentIndex + 1) % WIDGET_SIZES.length];
            //     widget.setSize(nextSize.colSpan, nextSize.rowSpan);
            // });

            // // Method to resize widget
            // widget.setSize = (newCols: number, newRows: number) => {
            //     widget.colSpan = newCols;
            //     widget.rowSpan = newRows;
            //     applyGridPosition();
            //     return widget;
            // };

            // Method to manually position widget (1-indexed col, row)
            widget.setPosition = (col: number, row: number) => {
                widget.col = col;
                widget.row = row;
                applyGridPosition();
                widgetController.update(col, row, widget.widgetId || widget.vDOM.identifier);
                return widget;
            };

            // Method to remove widget using LiOS remove()
            widget.removeWidget = () => {
                const idx = widgets.indexOf(widget);
                if (idx > -1) widgets.splice(idx, 1);
                widget.style().set({
                    transform: "scale(0.7)",
                    opacity: "0"
                });
                setTimeout(() => widget.remove(), 200);
            };

            // Long-press detection to enter edit mode (500ms hold)
            let longPressTimer: number | null = null;
            let startPointerX = 0;
            let startPointerY = 0;

            widget.on("pointerdown", (e: PointerEvent) => {
                if (editMode) return;
                if (e.button !== 0) return;
                startPointerX = e.clientX;
                startPointerY = e.clientY;

                longPressTimer = window.setTimeout(() => {
                    desktop.setEditMode(true);
                    if ("vibrate" in navigator) navigator.vibrate(40);
                }, 500);
            });

            widget.on("pointermove", (e: PointerEvent) => {
                if (longPressTimer && Math.hypot(e.clientX - startPointerX, e.clientY - startPointerY) > 8) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });

            const cancelLongPress = () => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            };
            widget.on("pointerup", cancelLongPress);
            widget.on("pointercancel", cancelLongPress);

            // Drag and Drop (active in Edit Mode)
            widget.on("pointerdown", (e: PointerEvent) => {
                if (!editMode) return;
                if ((e.target as HTMLElement).closest(".lios-widget-badge")) return;
                if (e.button !== 0) return;

                e.preventDefault();
                e.stopPropagation();

                const widgetEl = widget.getElement();
                const widgetRect = widgetEl.getBoundingClientRect();
                const offsetX = e.clientX - widgetRect.left;
                const offsetY = e.clientY - widgetRect.top;

                // Create Portal for Ghost on "body" using LiOS portal mechanism
                const portal = (this as any).ctx.nodeMethods.newPortal("body", "div");
                const ghost = this.connectPortal(portal);

                ghost.class.add("lios-widget-ghost");
                ghost.style().set({
                    position: "fixed",
                    left: `${widgetRect.left}px`,
                    top: `${widgetRect.top}px`,
                    width: `${widgetRect.width}px`,
                    height: `${widgetRect.height}px`,
                    zIndex: "99999",
                    pointerEvents: "none",
                    opacity: "0.9",
                    transform: "scale(1.05)",
                    boxShadow: "0 24px 48px rgba(0, 0, 0, 0.4)",
                    transition: "transform 0.1s ease, box-shadow 0.1s ease",
                    background: "var(--frosted-white, rgba(255, 255, 255, 0.15))",
                    backdropFilter: "blur(20px)",
                    webkitBackdropFilter: "blur(20px)",
                    borderRadius: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    padding: "16px",
                    boxSizing: "border-box",
                    overflow: "hidden"
                });

                // Clone visual contents into ghost (excluding controls)
                const ghostEl = ghost.getElement();
                ghostEl.innerHTML = widgetEl.innerHTML;
                const ghostControls = ghostEl.querySelector(".lios-widget-controls");
                if (ghostControls) ghostControls.remove();

                // Dim original widget & show placeholder
                widget.style().set({ opacity: "0.2" });
                widgetEl.style.opacity = "0.2";
                placeholder.style().set({
                    display: "block",
                    gridColumn: widgetEl.style.gridColumn || (widget.col ? `${widget.col} / span ${widget.colSpan}` : `span ${widget.colSpan}`),
                    gridRow: widgetEl.style.gridRow || (widget.row ? `${widget.row} / span ${widget.rowSpan}` : `span ${widget.rowSpan}`),
                    height: `${widgetRect.height}px`
                });

                let lastTargetCol = widget.col || 1;
                let lastTargetRow = widget.row || 1;

                const onPointerMove = (moveEvent: PointerEvent) => {
                    ghost.style().set({
                        left: `${moveEvent.clientX - offsetX}px`,
                        top: `${moveEvent.clientY - offsetY}px`
                    });

                    // Calculate target cell using the widget's top-left corner
                    const target = calculateGridCell(
                        moveEvent.clientX - offsetX,
                        moveEvent.clientY - offsetY,
                        widget.colSpan
                    );
                    lastTargetCol = target.col;
                    lastTargetRow = target.row;

                    placeholder.style().set({
                        gridColumn: `${lastTargetCol} / span ${widget.colSpan}`,
                        gridRow: `${lastTargetRow} / span ${widget.rowSpan}`,
                        height: `${widgetRect.height}px`
                    });
                };

                const onPointerUp = () => {
                    window.removeEventListener("pointermove", onPointerMove);
                    window.removeEventListener("pointerup", onPointerUp);
                    window.removeEventListener("pointercancel", onPointerUp);

                    // Remove ghost portal
                    ghost.remove();

                    // Snap widget to target cell
                    widget.setPosition(lastTargetCol, lastTargetRow);
                    widget.style().set({ opacity: "1" });
                    widgetEl.style.opacity = "1";

                    // Hide placeholder
                    placeholder.style().set({ display: "none" });
                };

                window.addEventListener("pointermove", onPointerMove);
                window.addEventListener("pointerup", onPointerUp);
                window.addEventListener("pointercancel", onPointerUp);
            });

            widgets.push(widget);
            return widget;
        };

        return desktop;
    },
    metadata: {
        name: "Desktop",
        api: {
            min: 4,
            max: 4
        },
        version: "1.0.0",
        versionCode: 1
    }
};
