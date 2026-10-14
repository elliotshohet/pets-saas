export class HttpError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
import { ZodError } from 'zod';
export function requestFailure(error: unknown) {
  const message =
    error instanceof HttpError
      ? error.message
      : error instanceof ZodError
        ? error.issues[0]?.message || 'Check the record fields and try again.'
        : 'Something went wrong. Your records have not been changed. Try again.';
  return Response.json(
    { error: message },
    { status: error instanceof HttpError ? error.status : error instanceof ZodError ? 400 : 500 },
  );
}
export async function boundedBody(request: Request, limit: number) {
  if (Number(request.headers.get('content-length')) > limit)
    throw new HttpError('This request is too large.', 413);
  if (!request.body) throw new HttpError('Choose a file.');
  const reader = request.body.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) {
        await reader.cancel();
        throw new HttpError('This request is too large.', 413);
      }
      parts.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(parts);
}
