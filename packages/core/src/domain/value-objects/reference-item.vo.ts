import { randomUUID } from "crypto";

export interface ReferenceItemProps<T> {
  instanceId?: string;
  refId: string; // ID of the static definition
  overrides?: Partial<T>;
}

/**
 * Generic class for the Reference + Override pattern.
 * T is the type of the data definition (e.g., ClanDefinition, PowerDefinition).
 */
export class ReferenceItem<T> {
  public readonly instanceId: string;
  public readonly refId: string;
  public readonly overrides: Partial<T>;

  constructor(props: ReferenceItemProps<T>) {
    this.instanceId = props.instanceId ?? randomUUID();
    this.refId = props.refId;
    this.overrides = props.overrides ?? {};
  }

  /**
   * Merges the static definition with the overrides to produce the final data.
   * @param staticDef The static definition from the registry
   */
  public resolve(staticDef: T): T {
    return {
      ...staticDef,
      ...this.overrides,
    };
  }

  public static create<T>(props: ReferenceItemProps<T>): ReferenceItem<T> {
    return new ReferenceItem<T>(props);
  }
}
