import Link from "next/link";
import "@/app/globals.css";

export default function NotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans">
        <div className="flex min-h-screen items-center justify-center px-6 py-12 text-center">
          <div className="space-y-6">
            <p className="select-none text-[8rem] font-bold leading-none text-neutral-200">
              404
            </p>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-neutral-900">
                Page not found
              </h1>
              <p className="text-neutral-500">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
            </div>
            <Link
              href="/en"
              className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
              Back to home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
