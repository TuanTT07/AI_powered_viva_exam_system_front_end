import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api/token-manager", () => ({
  tokenManager: { getToken: () => "token" },
}));
vi.mock("../api/runtime-config", () => ({
  runtimeConfig: { apiBaseUrl: "https://api.test" },
}));

import { connectSpeech } from "./speech-socket";

class FakeSocket {
  static OPEN = 1;
  static instance: FakeSocket;
  readyState = 1;
  bufferedAmount = 0;
  sent: unknown[] = [];
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  url: URL;
  constructor(url: URL) {
    this.url = url;
    FakeSocket.instance = this;
  }
  send(value: unknown) {
    this.sent.push(value);
  }
  close() {
    this.readyState = 3;
  }
  receive(value: object) {
    this.onmessage?.({ data: JSON.stringify(value) });
  }
}

const ready = {
  type: "session.ready",
  requestId: null,
  answerId: null,
  data: {
    encoding: "PCM_S16LE",
    sampleRate: 16000,
    channels: 1,
    ttsProvider: "deepgram",
  },
};

async function open(onDisconnect = vi.fn()) {
  const promise = connectSpeech(
    "ticket",
    () => {},
    onDisconnect,
    new AbortController().signal,
  );
  FakeSocket.instance.receive(ready);
  return { connection: await promise, socket: FakeSocket.instance, onDisconnect };
}

describe("speech socket stability", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("WebSocket", FakeSocket);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("sends audio straight through while the socket buffer is low", async () => {
    const { connection, socket } = await open();
    connection.audio(new ArrayBuffer(1600));
    expect(socket.sent).toHaveLength(1);
  });

  it("queues audio during a stall and keeps answer.end behind it", async () => {
    const { connection, socket } = await open();
    socket.bufferedAmount = 70_000;
    connection.audio(new ArrayBuffer(1600));
    connection.command({ type: "answer.end" });
    expect(socket.sent).toHaveLength(0);

    socket.bufferedAmount = 0;
    vi.advanceTimersByTime(100);

    expect(socket.sent).toHaveLength(2);
    expect((socket.sent[0] as ArrayBuffer).byteLength).toBe(1600);
    expect(typeof socket.sent[1]).toBe("string");
  });

  it("gives up only after the backlog exceeds roughly ten seconds of audio", async () => {
    const { connection, socket } = await open();
    socket.bufferedAmount = 70_000;
    expect(() => {
      for (let i = 0; i < 20; i++) connection.audio(new ArrayBuffer(32_768));
    }).toThrow(/không theo kịp/);
  });

  it("rejects malformed audio frames", async () => {
    const { connection } = await open();
    expect(() => connection.audio(new ArrayBuffer(0))).toThrow();
    expect(() => connection.audio(new ArrayBuffer(3))).toThrow();
    expect(() => connection.audio(new ArrayBuffer(40_000))).toThrow();
  });

  it("reports a half-open socket when the server stops answering heartbeats", async () => {
    const { onDisconnect } = await open();
    vi.advanceTimersByTime(30_000);
    expect(onDisconnect).not.toHaveBeenCalled();
    vi.advanceTimersByTime(20_000);
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it("stays connected while heartbeats are acknowledged", async () => {
    const { socket, onDisconnect } = await open();
    for (let i = 0; i < 8; i++) {
      vi.advanceTimersByTime(10_000);
      socket.receive({ type: "pong", requestId: null, answerId: null, data: {} });
    }
    expect(onDisconnect).not.toHaveBeenCalled();
  });
});
