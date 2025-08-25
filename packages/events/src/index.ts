/**
 * Events package public entrypoint.
 * Define Redis/pub-sub channel contracts & helpers.
 */
export interface PlaceholderEventsMarker {
  readonly _placeholder: true;
}
export const placeholderEventsMarker: PlaceholderEventsMarker = {
  _placeholder: true,
};
