import { Extension } from "../../LiOS-Open/modules/JS/ui";
import { widgetController } from "../modules/storageModule.ts";

export interface SystemWidgetsMethods {
    clock(col?: number, row?: number, identifier?: string): any;
    [key: string]: any;
}

declare module "../../LiOS-Open/modules/JS/ui/nodeMethods" {
    interface nodeMethods {
        widgets(): this & SystemWidgetsMethods;
    }
}

export const systemWidgets: Extension = {
    method: function (this: Extension) {
        this.clock = (col: number = Math.floor((this.columns / 2)), row: number = 1,identifier?:string) => {
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