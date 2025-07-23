import GatewayManager from "./GatewayManager";
import { GatewayEvents } from "../gateway/GatewayEvents";
import GatewayMessage from "./GatewayMessage";

export default class Client {
  constructor() {
    this.gatewayManager = new GatewayManager();
    this.gatewayManager.connect();
  }

  getState() {
    return this.gatewayManager.status;
  }

  handleGatewayEvents(clientState) {
    // Clear existing listeners
    this.gatewayManager.removeAllListeners();

    for (const key of Object.keys(GatewayEvents)) {
      const event = GatewayEvents[key];
      this.gatewayManager.on(event.name, (...args) => event.execute(...args));
    }
    this.gatewayManager.listenOnMessage(clientState);

    // Update the connection property when the WebSocket connects or disconnects
    this.gatewayManager.on("READY", () => {
      clientState.setConnection(true);
    });

    this.gatewayManager.on("DISCONNECT", () => {
      clientState.setConnection(false);
    });
  }

  refresh() {
    this.gatewayManager.refresh();
  }

  sheetSubscribe(id) {
    console.log();
    this.gatewayManager.send(new GatewayMessage().sheetSubscribe(id));
  }
}
