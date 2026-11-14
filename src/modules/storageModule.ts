export interface WidgetState {
    type: "clock" | "notes" | string;
    col: number;
    row: number;
    colSpan: number;
    rowSpan: number;
    data?: Record<string, any>;
    identifier: string;
}

export class StorageKeys{
    static WIDGETS = "widgets";
};


export const widgetController = {
    add: (widgetState: WidgetState) => {
        const storage = localStorage.getItem(StorageKeys.WIDGETS);
        const parsedStorage = storage !== null ? JSON.parse(storage) : {};

        parsedStorage[widgetState.identifier] = widgetState;
        localStorage.setItem(StorageKeys.WIDGETS, JSON.stringify(parsedStorage));
    },
    update: (col: number, row: number, identifier: string) => {
        const storage = localStorage.getItem(StorageKeys.WIDGETS);
        const parsedStorage = storage !== null ? JSON.parse(storage) : {};
        if (parsedStorage[identifier]) {
            parsedStorage[identifier].col = col;
            parsedStorage[identifier].row = row;
            localStorage.setItem(StorageKeys.WIDGETS, JSON.stringify(parsedStorage));
        }
    }
};

// Initialize default widgets