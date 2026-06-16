async function HandleUnauthorized(response: Response): Promise<void> {
  if (response.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export async function ApiGet<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: "no-store" });
  await HandleUnauthorized(response);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function ApiPut(path: string, body: unknown): Promise<void> {
  const response = await fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await HandleUnauthorized(response);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
}

export async function ApiPost(path: string, body?: unknown): Promise<Response> {
  const response = await fetch(path, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  await HandleUnauthorized(response);
  return response;
}
