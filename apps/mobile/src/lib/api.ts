/**
 * The MyTutor API. On a phone "localhost" is the phone itself: set EXPO_PUBLIC_API_URL to the
 * computer's address on the network (see .env.example).
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000').replace(
  /\/+$/,
  '',
);

/** A path the API serves (a test's figure, "media/q_….png") as a full URL. */
export const apiUrl = (path: string) => `${API_URL}/${path.replace(/^\/+/, '')}`;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function getJson(path: string): Promise<unknown> {
  const res = await fetch(apiUrl(path));
  if (!res.ok) throw new ApiError(res.status, `${res.status} ${path}`);
  return res.json();
}
