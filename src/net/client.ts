import type { ClientMsg, ServerMsg } from "./protocol";

const CLIENT_KEY = "tavern-client-id";
const NAME_KEY = "tavern-player-name";

export function getClientId() {
  try {
    let id = localStorage.getItem(CLIENT_KEY);
    if (!id) {
      id = `c-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
      localStorage.setItem(CLIENT_KEY, id);
    }
    return id;
  } catch {
    return `c-${Date.now()}`;
  }
}

export function getSavedName() {
  try {
    return localStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
}

export function saveName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* ignore */
  }
}

export function wsUrl() {
  const env = import.meta.env.VITE_WS_URL as string | undefined;
  if (env) return env;
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${location.host}/ws`;
}

type Handler = (msg: ServerMsg) => void;

let socket: WebSocket | null = null;
const handlers = new Set<Handler>();
let helloName = "旅人";

export function onServer(handler: Handler) {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

function emit(msg: ServerMsg) {
  for (const h of handlers) h(msg);
}

export function send(msg: ClientMsg) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return false;
  socket.send(JSON.stringify(msg));
  return true;
}

export function disconnect() {
  socket?.close();
  socket = null;
}

export function connect(name: string): Promise<void> {
  helloName = name.trim() || "旅人";
  saveName(helloName);
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    send({ t: "hello", name: helloName, clientId: getClientId() });
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const url = wsUrl();
    const ws = new WebSocket(url);
    socket = ws;
    const timer = window.setTimeout(() => {
      reject(new Error("连接超时，请确认联机服务已启动"));
      ws.close();
    }, 6000);
    ws.onopen = () => {
      window.clearTimeout(timer);
      send({ t: "hello", name: helloName, clientId: getClientId() });
      resolve();
    };
    ws.onerror = () => {
      window.clearTimeout(timer);
      emit({ t: "error", message: "无法连接房间服务" });
      reject(new Error("无法连接房间服务"));
    };
    ws.onmessage = (ev) => {
      try {
        emit(JSON.parse(String(ev.data)) as ServerMsg);
      } catch {
        /* ignore */
      }
    };
    ws.onclose = () => {
      if (socket === ws) socket = null;
    };
  });
}

export function isOnline() {
  return socket?.readyState === WebSocket.OPEN;
}
