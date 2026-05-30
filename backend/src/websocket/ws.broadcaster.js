"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastEvent = void 0;
const ws_server_1 = require("./ws.server");
const broadcastEvent = (type, data) => {
    const io = (0, ws_server_1.getIO)();
    console.log("Connected socket clients:", io.sockets.sockets.size);
    io.emit("nexus:event", {
        type,
        data,
        timestamp: new Date().toISOString(),
    });
};
exports.broadcastEvent = broadcastEvent;
//# sourceMappingURL=ws.broadcaster.js.map