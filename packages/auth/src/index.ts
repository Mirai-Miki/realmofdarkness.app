/**
 * Auth package public entrypoint.
 * Provide auth strategy abstractions here.
 */
export interface PlaceholderAuthMarker {
  readonly _placeholder: true;
}
export const placeholderAuthMarker: PlaceholderAuthMarker = {
  _placeholder: true,
};
