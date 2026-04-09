import { AxiosError } from "axios";

type ErrorRecord = Record<string, unknown>;

const findFirstString = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirstString(item);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (value && typeof value === "object") {
    for (const nested of Object.values(value as ErrorRecord)) {
      const found = findFirstString(nested);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    const message = findFirstString(data);
    if (message) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
