export default function TenantsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-8">
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#0A0F1E]">
        <h2 className="text-lg font-medium tracking-tight text-slate-900 dark:text-white">
          Tenants
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Multi-tenant accounts, plans, and provisioning controls.
        </p>
      </section>
    </div>
  );
}
