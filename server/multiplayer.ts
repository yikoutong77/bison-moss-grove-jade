import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { GameRoom, makeRoomCode } from "../src/game/room";
import type { ClientMsg, ServerMsg } from "../src/net/protocol";

const PORT = Number(process.env.MULTIPLAYER_PORT ?? 8787);
const rooms = new Map<string, GameRoom>();
const sockets = new Map<WebSocket, { playerId: string; room: GameRoom | null; clientId: string; name: string }>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function send(ws: WebSocket, msg: ServerMsg) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

function broadcast(room: GameRoom) {
  for (const [ws, meta] of sockets) {
    if (meta.room !== room || !meta.playerId) continue;
    send(ws, { t: "snapshot", snap: room.snapshot(meta.playerId) });
  }
}

function hooksFor(code: string) {
  return {
    onChange: () => {
      const room = rooms.get(code);
      if (room) broadcast(room);
    },
    schedule: (key: string, delayMs: number, fn: () => void) => {
      const prev = timers.get(key);
      if (prev) clearTimeout(prev);
      timers.set(
        key,
        setTimeout(() => {
          timers.delete(key);
          fn();
        }, delayMs),
      );
    },
    cancel: (key: string) => {
      const prev = timers.get(key);
      if (prev) clearTimeout(prev);
      timers.delete(key);
    },
  };
}

function getRoom(code: string) {
  return rooms.get(code.toUpperCase());
}

const server = createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  res.end("tavern-multiplayer");
});
const wss = new WebSocketServer({ server });
server.listen(PORT, "0.0.0.0", () => {
  console.log(`[multiplayer] ws://0.0.0.0:${PORT}`);
});

wss.on("connection", (ws) => {
  sockets.set(ws, { playerId: "", room: null, clientId: "", name: "旅人" });

  ws.on("message", (raw) => {
    let msg: ClientMsg;
    try {
      msg = JSON.parse(String(raw)) as ClientMsg;
    } catch {
      send(ws, { t: "error", message: "消息格式错误" });
      return;
    }
    const meta = sockets.get(ws);
    if (!meta) return;

    if (msg.t === "hello") {
      meta.clientId = msg.clientId || `c-${Date.now()}`;
      meta.name = msg.name?.trim() || "旅人";
      send(ws, { t: "welcome", clientId: meta.clientId });
      return;
    }

    if (msg.t === "ping") return;

    if (msg.t === "create") {
      let code = makeRoomCode();
      while (rooms.has(code)) code = makeRoomCode();
      const room = new GameRoom(code, hooksFor(code));
      rooms.set(code, room);
      const seat = room.addHuman(meta.clientId, meta.name);
      if ("error" in seat) {
        send(ws, { t: "error", message: seat.error });
        return;
      }
      meta.room = room;
      meta.playerId = seat.id;
      send(ws, { t: "joined", code, playerId: seat.id, hostId: room.hostId });
      broadcast(room);
      return;
    }

    if (msg.t === "join") {
      const room = getRoom(msg.code);
      if (!room) {
        send(ws, { t: "error", message: "房间不存在" });
        return;
      }
      const seat = room.addHuman(meta.clientId, meta.name);
      if ("error" in seat) {
        send(ws, { t: "error", message: seat.error });
        return;
      }
      meta.room = room;
      meta.playerId = seat.id;
      send(ws, { t: "joined", code: room.code, playerId: seat.id, hostId: room.hostId });
      broadcast(room);
      return;
    }

    if (msg.t === "leave") {
      if (meta.room && meta.playerId) meta.room.disconnect(meta.playerId, true);
      meta.room = null;
      meta.playerId = "";
      return;
    }

    if (!meta.room || !meta.playerId) {
      send(ws, { t: "error", message: "尚未加入房间" });
      return;
    }
    meta.room.handle(meta.playerId, msg);
  });

  ws.on("close", () => {
    const meta = sockets.get(ws);
    if (meta?.room && meta.playerId) meta.room.disconnect(meta.playerId);
    sockets.delete(ws);
  });
});
