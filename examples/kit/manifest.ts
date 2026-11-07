// A toy stand-in for the manifest contract, small enough to read in one sitting.
// It mirrors the shape of a manifest, not the Engine's API.

export type Layer = 'platform' | 'interface' | 'screen';

export interface Leaf<T> {
  value: T;
  type: string;
  required: boolean;
  editable: boolean;
  unique?: boolean;
}

export interface LeafOptions {
  editable: boolean;
  unique?: boolean;
}

/** An optional leaf: wraps one scalar in its envelope. */
export function field<T>(value: T, type: string, options: LeafOptions): Leaf<T> {
  return { value, type, required: false, ...options };
}

/** A required leaf: same envelope, marked required. */
export function requiredField<T>(value: T, type: string, options: LeafOptions): Leaf<T> {
  return { value, type, required: true, ...options };
}

export const SECTIONS_BY_LAYER: Record<Layer, readonly string[]> = {
  platform: [
    'Metadata',
    'PublicCommands',
    'TenantConfiguration',
    'FeatureFlags',
    'SystemRules',
    'BusinessRules',
    'TenantAwareOperations',
    'I18n',
  ],
  interface: [
    'Metadata',
    'PublicCommands',
    'Authorization',
    'TenantConfiguration',
    'FeatureFlags',
    'SystemRules',
    'BusinessRules',
    'TenantAwareOperations',
    'I18n',
  ],
  screen: ['Metadata', 'Authorization', 'I18n'],
};

/** Returns the problems of a manifest against the layer matrix; empty when it holds. */
export function checkLayerShape(manifest: Record<string, any>): string[] {
  const layer = manifest.Metadata?.layer?.value as Layer | undefined;
  if (!layer || !(layer in SECTIONS_BY_LAYER)) return [`unknown layer: ${String(layer)}`];
  const allowed = SECTIONS_BY_LAYER[layer];
  const present = Object.keys(manifest);
  const problems: string[] = [];
  for (const section of allowed) {
    if (!present.includes(section)) problems.push(`${layer}: missing section ${section}`);
  }
  for (const section of present) {
    if (!allowed.includes(section)) problems.push(`${layer}: section ${section} is not allowed`);
  }
  const serves = manifest.Metadata?.serves;
  if (layer === 'interface') {
    const forms = (serves?.screen ? 1 : 0) + (serves?.system ? 1 : 0);
    if (forms !== 1) problems.push('interface: Metadata.serves needs exactly one of screen or system');
  } else if (serves !== undefined) {
    problems.push(`${layer}: Metadata.serves belongs to interface only`);
  }
  return problems;
}

/** Every command id a manifest declares it consumes, through its SystemRules. */
export function consumedCommands(manifest: Record<string, any>): string[] {
  const items = manifest.SystemRules?.items ?? [];
  return items.map((item: any) => item.commandId.value as string);
}

/** Every command id a manifest offers, through its PublicCommands. */
export function offeredCommands(manifest: Record<string, any>): string[] {
  const items = manifest.PublicCommands?.items ?? [];
  return items.map((item: any) => item.commandId.value as string);
}
