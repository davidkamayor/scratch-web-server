import * as net from "net";

console.log("Welcome to my Web Server!\n");

const server = net.createServer();
server.on("connection", newConn);
server.listen({ host: "127.0.0.1", port: 1234 });
server.on("error", (err: Error) => {
  throw err;
});

function newConn(socket: net.Socket): void {
  console.log("new connection", socket.remoteAddress, socket.remotePort);
  socket.write("Welcome new client!\n");
  socket.on("end", () => {
    console.log("EOF.");
  });
  socket.on("data", (data: Buffer) => {
    console.log("data", data);
    socket.write(data);
    if (data.includes("q")) {
      console.log("closing");
      socket.end();
    }
  });
}

function soInit(socket: net.Socket): TCPConn {
  const conn: TCPConn = {
    socket: socket,
    err: null,
    ended: false,
    reader: null,
  };
  socket.on("data", (data: Buffer) => {
    console.assert(conn.reader);
    conn.socket.pause();
    conn.reader!.resolve(data);
    conn.reader = null;
  });
  socket.on("end", () => {
    conn.ended = false;
    if (conn.reader) {
      conn.reader.resolve(Buffer.from(""));
      conn.reader = null;
    }
    0;
  });
  socket.on("error", (err: Error) => {
    conn.err = err;
    if (conn.reader) {
      conn.reader.reject(err);
      conn.reader = null;
    }
  });
  return conn;
}

function soRead(conn: TCPConn): Promise<Buffer> {
  console.assert(!conn.reader); //no concurrent calls
  return new Promise((resolve, reject) => {
    conn.reader = { resolve: resolve, reject: reject };
    conn.socket.resume();
  });
}
function soWrite(conn: TCPConn, data: Buffer): Promise<void> {
  console.assert(data.length > 0);
  return new Promise((resolve, reject) => {
    if (conn.err) {
      reject(conn.err);
      return;
    }
  });
}

type TCPConn = {
  socket: net.Socket;
  err: null | Error;
  ended: boolean;
  reader: null | {
    resolve: (value: Buffer) => void;
    reject: (reason: Error) => void;
  };
};
