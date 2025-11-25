import { randomUUID } from "crypto";

export type EffectType = "ADD" | "MULTIPLY" | "OVERRIDE";

export interface ActiveEffectProps {
  id?: string;
  source: string; // e.g., "Blood Potency", "Spell: Haste"
  target: string; // e.g., "strength", "bloodPotency"
  value: number;
  type?: EffectType;
  duration?: string; // e.g., "scene", "turn", "permanent"
}

export class ActiveEffect {
  public readonly id: string;
  public readonly source: string;
  public readonly target: string;
  public readonly value: number;
  public readonly type: EffectType;
  public readonly duration: string;

  constructor(props: ActiveEffectProps) {
    this.id = props.id ?? randomUUID();
    this.source = props.source;
    this.target = props.target;
    this.value = props.value;
    this.type = props.type ?? "ADD";
    this.duration = props.duration ?? "permanent";
  }

  public static create(props: ActiveEffectProps): ActiveEffect {
    return new ActiveEffect(props);
  }
}
