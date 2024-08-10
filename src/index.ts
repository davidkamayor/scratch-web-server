import * as net from "net";

console.log("Welcome to my Web Server!");

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

let server = net.createServer();
server.on("connection", newConn);
server.listen({ host: "127.0.0.1", port: 1234 });
server.on("error", (err: Error) => {
  throw err;
});
