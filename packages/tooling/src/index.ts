/**
 * Tooling package public entrypoint.
 * Shared config exporters (ESLint, Prettier, tsconfig presets) can go here.
 */
export interface PlaceholderToolingMarker {
  readonly _placeholder: true;
}
export const placeholderToolingMarker: PlaceholderToolingMarker = {
  _placeholder: true,
};
