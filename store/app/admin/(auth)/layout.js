import { Apple } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <Apple size={18} aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Apple Store Admin</span>
        </div>
        <div className="a-card p-6 sm:p-7">{children}</div>
      </div>
    </main>
  );
}
