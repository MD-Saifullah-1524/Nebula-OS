import { widgetController } from "../modules/storageModule.js";
export const systemWidgets = {
    method: function () {
        this.clock = (col = Math.floor((this.columns / 2)), row = 1, identifier) => {
            const clock = this.widget({
                col: col,
                row: row,
                colSpan: 3,
                rowSpan: 2,
                id: identifier
            });
            const timeArea = clock.child("div");
            const dateArea = clock.child("div");
            clock.effects().frostedGlass({ blur: "2px" });
            clock.style().set({
                "--padding": "10px",
                padding: "var(--padding)",
                "--background": "var(--frosted-white)",
                background: "var(--background)",
                borderRadius: "var(--padding)",
                minWidth: "fit-content",
                height: "fit-content",
                justifySelf: "center"
            });
            timeArea.style().set({
                fontSize: "58px",
                textAlign: "center",
                display: "flex",
                justifySelf: "center"
            });
            dateArea.style().set({
                textAlign: "center"
            });
            widgetController.add({
                col: col,
                row: row,
                colSpan: 3,
                rowSpan: 2,
                identifier: clock.widgetId || clock.vDOM.identifier,
                type: "system/clock"
            });
            setInterval(() => {
                const date = new Date();
                const time = date.toLocaleTimeString();
                const day = date.toDateString();
                timeArea.clear();
                timeArea.text(time);
                dateArea.clear();
                dateArea.text(day);
            }, 1000);
            return this;
        };
        return this;
    },
    metadata: {
        name: "Built in widgets",
        api: {
            min: 4,
            max: 4
        },
        version: "1",
        versionCode: 1
    }
};
//# sourceMappingURL=widgets.js.map