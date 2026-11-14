const dockInstances = new WeakMap();
export const dock = {
    method: function () {
        const cached = dockInstances.get(this);
        if (cached) {
            return cached;
        }
        const dock = this.child("nav");
        const appDrawer = this.child("div").effects().frostedGlass().style().set({
            display: "none",
            position: "fixed",
            "--background": "var(--frosted-white)",
            width: "90%",
            height: "80%",
            left: "5%",
            top: "10%",
            zIndex: 10,
            "--padding": "20px",
            padding: "var(--padding)",
            background: "var(--background)",
            border: "2px solid var(--background)",
            borderRadius: "var(--padding)",
            boxSizing: "border-box",
            flexWrap: "wrap",
            alignContent: "flex-start",
            gap: "20px",
            flexDirection: "row"
        });
        appDrawer.on("click", (e) => {
            e.stopPropagation();
        });
        const drawer = {
            isVisible: false,
            toggle: (forceHide = false) => {
                if (!drawer.isVisible) {
                    if (forceHide)
                        return;
                    appDrawer.style().set({
                        display: "flex"
                    });
                    drawer.isVisible = true;
                }
                else {
                    appDrawer.style().set({
                        display: "none"
                    });
                    drawer.isVisible = false;
                }
                ;
            },
            add: (logo, label, callback) => {
                const itemContainer = appDrawer.child("div");
                const itemLogo = itemContainer.svg(logo);
                const itemLabel = itemContainer.child("span").text(label);
                itemContainer.style().set({
                    display: "flex",
                    width: "50px",
                    height: "50px",
                    padding: "5px",
                    borderRadius: "5px",
                    flexDirection: "column",
                    background: "none",
                    transition: "background 0.2s ease-in-out",
                    cursor: "pointer"
                });
                itemContainer.style(":hover").set({
                    background: "var(--frosted-white)"
                });
                itemLogo.style().set({
                    width: "48px",
                    height: "48px"
                });
                itemLabel.style().set({
                    textAlign: "center",
                    fontSize: "12px",
                    color: "var(--black)"
                });
                itemContainer.on("click", () => {
                    drawer.toggle(true);
                    callback();
                });
            }
        };
        dock.drawer = drawer;
        this.on("click", () => {
            dock.drawer.toggle(true);
        });
        const dockItems = new Map();
        dock.effects().frostedGlass({
            blur: "10px"
        });
        dock.style().set({
            "--background": "var(--frosted-white)",
            display: "flex",
            position: "fixed",
            justifySelf: "center",
            bottom: "5%",
            background: "var(--background)",
            "--padding": "5px",
            padding: "var(--padding)",
            borderRadius: "var(--padding)",
            border: "2px outset var(--background)",
            zIndex: "1"
        });
        dock.add = (svg, callback) => {
            const newButton = dock.svg(svg).on("click", callback);
            newButton.style().set({
                cursor: "pointer",
                borderRadius: "inherit",
                padding: "15px",
                transition: "background 0.2s ease-in-out"
            }).style(":hover").set({
                background: "inherit"
            });
            return newButton;
        };
        dock.unregister = (identifier) => {
            const item = dockItems.get(identifier);
            item?.remove();
            dockItems.delete(identifier);
        };
        dock.register = (icon, identifier, isSVG = true) => {
            let item;
            if (isSVG) {
                item = dock.svg(icon);
            }
            else {
                item = dock.child("img").attr({
                    src: icon
                });
            }
            ;
            item.style().set({
                cursor: "pointer",
                borderRadius: "inherit",
                padding: "15px",
                transition: "background 0.2s ease-in-out",
                width: "25px",
                height: "25px"
            }).style(":hover").set({
                background: "inherit"
            });
            dockItems.set(identifier, item);
            return item;
        };
        dock.add(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-grid preview-icon"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`, (e) => {
            e.stopPropagation();
            dock.drawer.toggle();
        });
        dockInstances.set(this, dock);
        return dock;
    },
    metadata: {
        name: "Extension",
        api: {
            min: 4,
            max: 4
        },
        version: "1",
        versionCode: 1
    }
};
//# sourceMappingURL=dock.js.map