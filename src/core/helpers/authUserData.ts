const USER_DATA_KEY = "user_data";

export function setUserData(value: unknown) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(value));
    }
  } catch {}
}

export function getUserData<T = unknown>(): T | undefined {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(USER_DATA_KEY);
      if (!raw) return undefined;
      return JSON.parse(raw) as T;
    }
  } catch {}
  return undefined;
}

export function updateUserData<T extends object = Record<string, any>>(
  patch: Partial<T>
): T | undefined {
  try {
    const current = (getUserData<T>() ?? {}) as T;
    const next = { ...(current as any), ...(patch as any) } as T;
    setUserData(next);
    return next;
  } catch {
    return undefined;
  }
}

export function clearUserData() {
  try {
    if (typeof window !== "undefined") localStorage.removeItem(USER_DATA_KEY);
  } catch {}
}
