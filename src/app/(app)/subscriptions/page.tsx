export default function SubscriptionsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-8">
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#0A0F1E]">
        <h2 className="text-lg font-medium tracking-tight text-slate-900 dark:text-white">
          Subscriptions
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Active plans, renewals, and billing cycles.
        </p>
      </section>
    </div>
  );
}
