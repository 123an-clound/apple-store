export default function FormMessage({ state, success }) {
  if (state?.error) {
    return <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-300">{state.error}</p>;
  }
  if (state?.ok && success) {
    return <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{success}</p>;
  }
  return null;
}
