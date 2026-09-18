import type { SpeciesPrintsResult } from './fetchSpeciesPrints';

export async function loadSpeciesPrints(dex: number): Promise<SpeciesPrintsResult> {
  const response = await fetch(`/api/cards?dex=${dex}`);
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Lookup failed (${response.status})`);
  }
  return (await response.json()) as SpeciesPrintsResult;
}
