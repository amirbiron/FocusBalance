import { useLiveQuery } from 'dexie-react-hooks';
import { getLocalUser } from '@/db/repositories/users';
import type { User } from '@/db/schema';

/**
 * Hook ראקטיבי שמחזיר את המשתמש המקומי.
 * משתמש ב-dexie-react-hooks כדי להתעדכן אוטומטית בכל שינוי.
 *
 * מחזיר:
 * - undefined בזמן טעינה ראשונית
 * - null אם עוד לא בוצע אונבורדינג
 * - User אם קיים
 */
export function useLocalUser(): User | null | undefined {
  return useLiveQuery(async () => {
    const user = await getLocalUser();
    return user ?? null;
  }, []);
}
