import { liosOpen } from "../../LiOS-Open/liosOpen.ts";
import { nodeMethods } from "../../LiOS-Open/modules/JS/ui/nodeMethods.ts";
import { dockNav } from "../main.ts";
import { Desktop } from "./desktop.ts";


export class WindowManager{
    desktop:Desktop
    constructor(desktop:Desktop) {
        this.desktop = desktop
    };
    #windows = new Map<string, nodeMethods>();
    #minimizedWindows = new Map<string, nodeMethods>();

    newWindow = (name: string,img:string,isSVG = false) => {
        const windowPortal = liosOpen.ui.newPortal("#Desktop", "div");
        const window = this.desktop.connectPortal(windowPortal);
        window.effects().frostedGlass({
            blur: "10px"
        });
        window.style().set({
            resize: "both",
            display: "flex",
            flexDirection: "column",
            zIndex: 5,
            position: "fixed",
            background: "var(--frosted-white)",
            height: "500px",
            width: "700px",
            overflow: "hidden",
            borderRadius: "15px",
        });
        const titleBar = window.child("div");
        titleBar.style().set({
            borderBottom: "2px solid var(--white)",
            display: "flex",
            flexDirection: "row-reverse",
            justifyContent: "space-between",
            alignItems: "stretch",
            height: "30px",
            padding: "0",
            inset: "0",
            cursor:"pointer"
        });
        const titleBarControls = titleBar.child("div");
        const titleBarMeta = titleBar.child("div");
        titleBarMeta.style().set({
            display: "flex",
            alignItems: "center",
            paddingLeft: "10px",
            gap:"5px"
        });
        if (img) {
            const container:nodeMethods = titleBarMeta.child("div").style().set({
                overflow: "none",
                borderRadius: "100vh"
            });
            if(!isSVG){
                container.child("img").attr({
                    src: img
                });
            } else {
                container.svg(img);
            };
            container.style().set({
                width: "20px",
                height:"20px"
            });
        };
        titleBarMeta.child("span").text(name);
        const app = window.child("div") as nodeMethods & { close: () => void, minimize: () => string, registerNewControl: (callback: (...any: any) => {}, svg: string) => void };
        this.#windows.set(name, window);
        let dockItem: nodeMethods
        if (isSVG) {
            dockItem = dockNav.register(img, window.vDOM.identifier, true);
        } else {
            dockItem = dockNav.register(img, window.vDOM.identifier, false);
        };
        let isMinimized = false;
        const show = () => {
            window.style().set({
                display: "flex"
            });
            this.#minimizedWindows.delete(window.vDOM.identifier);
            isMinimized = false;
        };
        const hide = () => {
            window.style().set({
                display: "none"
            });
            this.#minimizedWindows.set(window.vDOM.identifier, window);
            isMinimized = true;
        };
        dockItem.on("click", () => {
            if (isMinimized) {
                show();
            } else {
                hide();
            }
        });
        const closeFunction = () => {
            this.#windows.delete(name);
            dockNav.unregister(window.vDOM.identifier);
            window.remove();
        };
        const minimize = () => {
            hide();
            return window.vDOM.identifier;
        };
        titleBarControls.style().set({
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "stretch",
            width: "fit-content",
            height: "100%"
        });
        const registerNewControl = (callback: (...any: any) => {}, svg: string) => {
            titleBarControls.child("div").style().set({
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "25px",
                height: "100%",
                cursor: "pointer",
                transition:"background 0.2s ease-in-out"
            }).style(":hover").set({
                background:"var(--frosted-white)"
            }).on("click", callback).svg(svg).style().set({
                pointerEvents: "none"
            });
        };
        const closeButton = titleBarControls.child("div");
        closeButton.style().set({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "red",
            width: "25px",
            height: "100%",
            cursor: "pointer",
        }).on("click", closeFunction);
        closeButton.svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x preview-icon"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`).style().set({
            pointerEvents: "none",
        });
        registerNewControl(minimize, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus preview-icon"><path d="M5 12h14"/></svg>`);
        app.close = closeFunction;
        app.minimize = minimize;
        app.registerNewControl = registerNewControl;
        const enableDrag = (titleBar: HTMLElement, container: HTMLElement) => {
            let isDragging = false;
            let offsetX: number, offsetY: number = 0;

            titleBar.addEventListener("mousedown", (e) => {
                isDragging = true;
                const rect = container.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;

                document.body.style.userSelect = "none";

            });
            document.addEventListener("mousemove", (e) => {
                if (!isDragging) return;

                container.style.left = `${e.clientX - offsetX}px`;
                container.style.top = `${e.clientY - offsetY}px`;
            });

            document.addEventListener("mouseup", () => {
                if (!isDragging) return;
                isDragging = false;
                document.body.style.userSelect = "unset";
            });
        };
        enableDrag(titleBar.getElement(), window.getElement());
        return app;
    }
}