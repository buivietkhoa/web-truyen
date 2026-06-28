const transientDatabaseCodes = new Set([
  "P1001",
  "P1002",
  "P1017",
  "ECONNRESET",
  "ETIMEDOUT",
  "EPIPE",
  "57P01",
  "57P02",
  "57P03",
]);

function isTransientDatabaseError(error: unknown) {
  const candidate = error as { code?: unknown; message?: unknown; cause?: unknown };
  const code = typeof candidate?.code === "string" ? candidate.code : "";
  const message =
    typeof candidate?.message === "string" ? candidate.message.toLowerCase() : "";

  return (
    transientDatabaseCodes.has(code) ||
    message.includes("connection timeout") ||
    message.includes("connection terminated") ||
    message.includes("connection reset") ||
    message.includes("can't reach database") ||
    message.includes("timed out")
  );
}

export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  attempts = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isTransientDatabaseError(error) || attempt === attempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 400));
    }
  }

  throw lastError;
}
