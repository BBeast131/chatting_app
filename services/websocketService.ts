export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

export type ChatMessage = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  direction: "incoming" | "outgoing";
};

export type WebSocketConfig = {
  url: string;
  user: string;
  token: string;
};

export type WebSocketHandlers = {
  onMessage: (message: ChatMessage) => void;
  onStatus: (status: ConnectionStatus, reason?: string) => void;
};

export default class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000;
  private readonly handlers: WebSocketHandlers;
  private readonly url: string;
  private readonly user: string;
  private readonly token: string;

  constructor(config: WebSocketConfig, handlers: WebSocketHandlers) {
    this.url = config.url;
    this.user = config.user;
    this.token = config.token;
    this.handlers = handlers;
  }

  connect() {
    this.clearReconnectTimer();
    this.handlers.onStatus("connecting");
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.handlers.onStatus("connected");
      this.sendAuth();
    };

    this.socket.onmessage = (event) => {
      this.handleIncoming(event.data);
    };

    this.socket.onclose = (event) => {
      const reason = event.reason || "Socket closed";
      this.handlers.onStatus("disconnected", reason);
      this.scheduleReconnect();
    };

    this.socket.onerror = (event) => {
      const reason = "WebSocket error";
      this.handlers.onStatus("error", reason);
      this.scheduleReconnect();
    };
  }

  close() {
    this.clearReconnectTimer();
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(text: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not open");
    }

    const payload = {
      type: "message",
      author: this.user,
      text,
      timestamp: new Date().toISOString(),
    };

    this.socket.send(JSON.stringify(payload));
  }

  private sendAuth() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const authPayload = {
      type: "auth",
      user: this.user,
      token: this.token,
    };

    this.socket.send(JSON.stringify(authPayload));
  }

  private handleIncoming(rawData: string) {
    try {
      const parsed = JSON.parse(rawData);
      const message: ChatMessage = {
        id: parsed.id || `${Date.now()}-${Math.random()}`,
        author: parsed.author || "Server",
        text: parsed.text ?? JSON.stringify(parsed),
        timestamp: parsed.timestamp || new Date().toISOString(),
        direction: "incoming",
      };
      this.handlers.onMessage(message);
    } catch (error) {
      console.warn("Received non-JSON message from WebSocket:", rawData);
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.handlers.onStatus("disconnected", "Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts += 1;
    this.handlers.onStatus("reconnecting", `Attempt ${this.reconnectAttempts}`);
    this.clearReconnectTimer();

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
