export class StorageKeys {
    static WIDGETS = "widgets";
}
;
export const widgetController = {
    add: (widgetState) => {
        const storage = localStorage.getItem(StorageKeys.WIDGETS);
        const parsedStorage = storage !== null ? JSON.parse(storage) : {};
        parsedStorage[widgetState.identifier] = widgetState;
        localStorage.setItem(StorageKeys.WIDGETS, JSON.stringify(parsedStorage));
    },
    update: (col, row, identifier) => {
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
//# sourceMappingURL=storageModule.js.map