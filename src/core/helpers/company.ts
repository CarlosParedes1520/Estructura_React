// src/core/utils/company.ts
const COMPANY_KEY = "company";

export function setCompanyCode(value: string) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(COMPANY_KEY, value);
    }
  } catch {}
}

export function getCompanyCode(): string | undefined {
  try {
    if (typeof window !== "undefined") {
      return localStorage.getItem(COMPANY_KEY) || undefined;
    }
  } catch {}
  return undefined;
}

export function clearCompanyCode() {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(COMPANY_KEY);
    }
  } catch {}
}
