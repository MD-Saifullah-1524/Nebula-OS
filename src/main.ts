import { dailyWallpaper } from "./bingWallpaper.ts"
import { liosOpen } from "./../LiOS-Open/liosOpen.js"
import { dock } from "./extensions/dock.ts";
import { desktop } from "./extensions/desktop.ts";
import { WindowManager } from "./extensions/windowManager.ts";
import { systemWidgets } from "./extensions/widgets.ts";
import { WidgetState } from "./modules/storageModule.ts";
import { settings } from "./extensions/settings.ts";

const ui = liosOpen.ui;
ui.extend("effects", liosOpen.uiExtensions.effects);

const main = new ui("main");

// Change wallpaper
const root = document.documentElement;
root.style.backgroundImage = `url("${dailyWallpaper.url}")`;
root.style.backgroundSize = "cover";
root.style.backgroundPosition = "center";
root.style.backgroundRepeat = "no-repeat";
root.style.backgroundAttachment = "fixed";

// 
// Extensions as System components
main.extend("dock", dock)
main.extend("desktop", desktop);
main.extend("widgets", systemWidgets);
main.extend("settings", settings);
export const dockNav = main.dock();
export const myDesktop = main.desktop();
// 
myDesktop.id("Desktop")
export const windowManager = new WindowManager(myDesktop);

// Default extensions
const rawWidgets = localStorage.getItem("widgets");
const parsedWidgets = rawWidgets ? JSON.parse(rawWidgets) : null;
// 

// Runs if null OR if {} has 0 widgets
if (!parsedWidgets || Object.keys(parsedWidgets).length === 0) {
    myDesktop.widgets().clock();
} else {
    for (const [, widget] of Object.entries(parsedWidgets)) {
        const [provider, type] = (widget as WidgetState).type.split("/");
        if (provider === "system") {
            const w = widget as WidgetState;
            myDesktop.widgets()[type]?.(w.col, w.row, w.identifier);
        }
    }
}