/**
 * Gateway package public entrypoint.
 * WebSocket protocol definitions & helpers will live here.
 */
export interface PlaceholderGatewayMarker {
  readonly _placeholder: true;
}
export const placeholderGatewayMarker: PlaceholderGatewayMarker = {
  _placeholder: true,
};
