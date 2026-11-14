import { dailyWallpaper } from "./bingWallpaper.js";
import { liosOpen } from "./../LiOS-Open/liosOpen.js";
import { dock } from "./extensions/dock.js";
import { desktop } from "./extensions/desktop.js";
import { WindowManager } from "./extensions/windowManager.js";
import { systemWidgets } from "./extensions/widgets.js";
import { settings } from "./extensions/settings.js";
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
main.extend("dock", dock);
main.extend("desktop", desktop);
main.extend("widgets", systemWidgets);
main.extend("settings", settings);
export const dockNav = main.dock();
export const myDesktop = main.desktop();
// 
myDesktop.id("Desktop");
export const windowManager = new WindowManager(myDesktop);
// Default extensions
const rawWidgets = localStorage.getItem("widgets");
const parsedWidgets = rawWidgets ? JSON.parse(rawWidgets) : null;
// 
// Runs if null OR if {} has 0 widgets
if (!parsedWidgets || Object.keys(parsedWidgets).length === 0) {
    myDesktop.widgets().clock();
}
else {
    for (const [, widget] of Object.entries(parsedWidgets)) {
        const [provider, type] = widget.type.split("/");
        if (provider === "system") {
            const w = widget;
            myDesktop.widgets()[type]?.(w.col, w.row, w.identifier);
        }
    }
}
//# sourceMappingURL=main.js.map