"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function lens(path, prop) {
    path = typeof prop !== "undefined" && prop !== null ? path.concat(prop) : path;
    return {
        key: lens.bind(null, path),
        index: lens.bind(null, path),
        path: path
    };
}
function makeLens() {
    return lens.call(null, [], null);
}
exports.makeLens = makeLens;
//# sourceMappingURL=lens.js.map