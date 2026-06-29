export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800">404</h1>
        <p className="text-slate-500 mt-2">Page not found</p>
        <a href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
