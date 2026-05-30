import { getIO } from "./ws.server";

export const broadcastEvent = (type: string, data: any) => {
  const io = getIO();

  console.log("Connected socket clients:", io.sockets.sockets.size);

  io.emit("nexus:event", {
    type,
    data,
    timestamp: new Date().toISOString(),
  });
};