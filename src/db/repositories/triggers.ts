import { db } from '../database';
import type { Trigger, TriggerCategory } from '../schema';

export async function listTriggers(): Promise<Trigger[]> {
  return db.triggers.toArray();
}

export async function listTriggersByCategory(): Promise<Record<TriggerCategory, Trigger[]>> {
  const all = await db.triggers.toArray();
  const grouped: Record<TriggerCategory, Trigger[]> = {
    task: [],
    cognitive: [],
    physical: [],
    emotional: [],
    habit: [],
    other: [],
  };
  for (const t of all) grouped[t.category].push(t);
  return grouped;
}

export async function addCustomTrigger(
  category: TriggerCategory,
  label: string,
  icon = '✨'
): Promise<number> {
  const clean = label.trim();
  if (clean.length === 0) throw new Error('יש להזין שם לטריגר');
  if (clean.length > 60) throw new Error('שם הטריגר ארוך מדי');
  const id = await db.triggers.add({ category, label: clean, icon, isSystem: false });
  return id as number;
}
