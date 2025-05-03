import http from "http";
import { TokenBridge } from "./token-bridge";
import { Config } from "./config";
import { MessageBridge } from "./message-bridge";

const tokenBridge = new TokenBridge();
const messageBridge = new MessageBridge();

class Server {
  private readonly port = Number(process.env.PORT);

  start() {
    const server = http.createServer((req, res) => {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        res.setHeader("Content-Type", "application/json");

        try {
          if (
            req.url === "/holesky-token-tranfer-events" &&
            req.method === "POST"
          ) {
            tokenBridge.addHoleskyEvents(JSON.parse(body));
          } else if (
            req.url === "/iota-token-tranfer-events" &&
            req.method === "POST"
          ) {
            tokenBridge.addIotaEvents(JSON.parse(body));
          } else if (
            req.url === "/holesky-message-sent-events" &&
            req.method === "POST"
          ) {
          } else if (
            req.url === "/iota-message-sent-events" &&
            req.method === "POST"
          ) {
          } else {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: "Not found" }));
          }

          res.writeHead(200);
          res.end(JSON.stringify({ status: "OK" }));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    });

    return server.listen(this.port);
  }
}

const server = new Server();
server.start();

setInterval(
  () => tokenBridge.processIotaEvents(),
  Config.IOTA_EVENT_INTERVAL_MS
);

setInterval(
  () => tokenBridge.processHoleskyEvents(),
  Config.HOLESKY_EVENT_INTERVAL_MS
);
