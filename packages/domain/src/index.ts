/**
 * Domain package public entrypoint.
 * Export rich domain models & pure business logic here.
 */
export interface PlaceholderDomainMarker {
  readonly _placeholder: true;
}

export const placeholderDomainMarker: PlaceholderDomainMarker = {
  _placeholder: true,
};
