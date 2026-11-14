import { windowManager } from "../main.js";
;
const settingsLogo = `<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings preview-icon"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>`;
export const openSettings = () => {
    const app = windowManager.newWindow("Settings", settingsLogo, true);
};
export const settings = {
    method: function () {
        // No commands
    },
    initOnce: function () {
        const dock = this.dock();
        const drawer = dock.drawer;
        drawer.add(settingsLogo, "Settings", openSettings);
    },
    metadata: {
        name: "Settings for NebulaOS",
        api: {
            min: 4,
            max: 4
        },
        version: "1.0.0",
        versionCode: 1
    }
};
//# sourceMappingURL=settings.js.map