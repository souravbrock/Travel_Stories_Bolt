import { Settings2 } from "lucide-react";

export function ConfigNotice({ context }: { context: string }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-sand-200 ts-fade-in">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning-500/10">
        <Settings2 className="h-6 w-6 text-warning-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">
        Supabase is not configured
      </h3>
      <p className="mx-auto mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
        {context} needs <code className="rounded bg-sand-100 px-1">VITE_SUPABASE_URL</code>{" "}
        and <code className="rounded bg-sand-100 px-1">VITE_SUPABASE_ANON_KEY</code>.
      </p>
      <ol className="mx-auto mt-4 max-w-xl space-y-1.5 text-left text-sm text-slate-600">
        <li>
          <span className="font-semibold text-slate-800">1.</span> Copy{" "}
          <code className="rounded bg-sand-100 px-1">.env.example</code> to{" "}
          <code className="rounded bg-sand-100 px-1">.env</code>
        </li>
        <li>
          <span className="font-semibold text-slate-800">2.</span> Fill in your
          Supabase project URL + anon key
        </li>
        <li>
          <span className="font-semibold text-slate-800">3.</span> Apply seed
          data: <code className="rounded bg-sand-100 px-1">supabase db push</code>
        </li>
        <li>
          <span className="font-semibold text-slate-800">4.</span> Restart the
          dev server (<code className="rounded bg-sand-100 px-1">npm run dev</code>)
        </li>
      </ol>
    </div>
  );
}
