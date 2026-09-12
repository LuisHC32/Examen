export class ApiError extends Error {
  status: number;
  details?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    details?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => ({
    error: "Error inesperado",
  }))) as { error?: string; details?: Record<string, string> };

  if (!response.ok) {
    throw new ApiError(
      payload.error ?? "Error inesperado",
      response.status,
      payload.details,
    );
  }

  return payload as T;
}

export function errorToastMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.details) {
      const first = Object.values(error.details)[0];
      if (first) return `${error.message}: ${first}`;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Ocurrió un error";
}
