"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <button
              onClick={() => reset()}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
