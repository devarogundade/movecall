import http from "http";
import { TokenBridge } from "./token-bridge";
import { Config } from "./config";

const tokenBridge = new TokenBridge();

class Server {
  readonly port = 8000;
  readonly host = "localhost";

  start() {
    const server = http.createServer((req, res) => {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
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
          }

          res.setHeader("Content-Type", "application/json");
          res.writeHead(200);
          res.end(JSON.stringify({ status: "OK" }));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    });

    server.listen(this.port, this.host, () => {
      console.log(`Server is running on http://${this.host}:${this.port}`);
    });
  }
}

new Server().start();

setInterval(
  () => tokenBridge.processIotaEvents(),
  Config.IOTA_EVENT_INTERVAL_MS
);

setInterval(
  () => tokenBridge.processHoleskyEvents(),
  Config.HOLESKY_EVENT_INTERVAL_MS
);
