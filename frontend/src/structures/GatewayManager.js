import GatewayMessage from "./GatewayMessage";
import { GATEWAY_OPCODE } from "../constants";
const { EventEmitter } = require("events");

const cooldownTimer = {
  0: 0,
  1: 5,
  2: 10,
  3: 20,
};

let host;
if (process.env.NODE_ENV === "production")
  host = "wss://realmofdarkness.app/gateway/web/";
else if (process.env.NODE_ENV === "preproduction")
  host = "wss://dev.realmofdarkness.app/gateway/web/";
else host = "ws://localhost:8080/gateway/web/";

function incrementCooldown(cooldown) {
  let t = cooldown + 1;
  if (t > 3) t = 3;
  return t;
}

export default class GatewayManager extends EventEmitter {
  constructor() {
    super();
    this.cooldown = 0;
  }

  connect() {
    this.ws = new WebSocket(host);

    this.ws.onopen = () => {
      this.emit("CONNECT", this.setConnection);
      this.cooldown = 0;
      console.log("Socket Connected");
    };

    this.ws.onclose = (e) => {
      this.emit("DISCONNECT", this.setConnection);
      const timer = cooldownTimer[this.cooldown];
      console.log(`Socket has closed. Reconnecting in ${timer} seconds.`);
      setTimeout(this.connect.bind(this), timer * 1000);
      this.cooldown = incrementCooldown(this.cooldown);
    };

    this.ws.onerror = (e) => {
      console.error("Socket encountered error: Closing socket");
      console.error(e);
      this.ws.close();
    };

    this.listenOnMessage();
  }

  listenOnMessage(contextSetters = null) {
    if (contextSetters) this.contextSetters = contextSetters;
    else if (!this.contextSetters) return;

    this.ws.onmessage = (message) => {
      const json = message.data;
      const gm = new GatewayMessage().loadJson(json);

      switch (gm.getOpcode()) {
        case GATEWAY_OPCODE.dispatch:
          this.emit(gm.getEventName(), gm.getData(), this.contextSetters);
          break;
        case GATEWAY_OPCODE.welcome:
          // send Identify message
          this.send(new GatewayMessage().identify());
          break;
        default:
          break;
      }
    };
  }

  send(gatewayMessage) {
    this.ws.send(gatewayMessage.toJson());
  }

  disconnect() {
    this.ws.close();
  }

  refresh() {
    this.send(new GatewayMessage().refresh());
  }
}
