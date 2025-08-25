import { GATEWAY_OPCODE } from "../constants";

/**
 * Represents a Gateway Message with utility functions
 */
export default class GatewayMessage {
  constructor() {
    this.data = {
      op: null, // opcode for the payload
      d: null, // Event data
      // s: Sequence number for resuming sessions
      t: null, // Event name for this payload
    };
  }

  getOpcode() {
    return this.data.op;
  }

  getData() {
    return this.data.d;
  }

  getEventName() {
    return this.data.t;
  }

  identify() {
    this.data.op = GATEWAY_OPCODE.identify;
    this.data.d = null;
    this.data.t = null;
    // Will send Data at some point
    return this;
  }

  refresh() {
    this.data.op = GATEWAY_OPCODE.refresh;
    this.data.d = null;
    this.data.t = null;
    // Will send Data at some point
    return this;
  }

  sheetSubscribe(id) {
    this.data.op = GATEWAY_OPCODE.request;
    this.data.t = "sheet_subscribe";
    this.data.d = { id: id };
    return this;
  }

  loadJson(data) {
    this.data = JSON.parse(data);
    return this;
  }

  toJson() {
    return JSON.stringify(this.data);
  }
}
