import { ServerCrash } from "lucide-react";
import { API_BASE } from "../lib/api";

/** Shown when the PHP/MySQL backend cannot be reached. Same-origin /api
 *  in production; VITE_API_BASE override in development. */
export function ConfigNotice({ context }: { context: string }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-sand-200 ts-fade-in">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-error-500/10">
        <ServerCrash className="h-6 w-6 text-error-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">
        Could not reach the travel API
      </h3>
      <p className="mx-auto mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
        {context} loads from{" "}
        <code className="rounded bg-sand-100 px-1">{API_BASE}</code>. Check:
      </p>
      <ol className="mx-auto mt-4 max-w-xl space-y-1.5 text-left text-sm text-slate-600">
        <li>
          <span className="font-semibold text-slate-800">1.</span> API server is
          running and <code className="rounded bg-sand-100 px-1">config/config.php</code>{" "}
          exists with valid DB credentials
        </li>
        <li>
          <span className="font-semibold text-slate-800">2.</span> Database has{" "}
          <code className="rounded bg-sand-100 px-1">schema</code> +{" "}
          <code className="rounded bg-sand-100 px-1">seed.sql</code> imported
        </li>
        <li>
          <span className="font-semibold text-slate-800">3.</span> Open{" "}
          <code className="rounded bg-sand-100 px-1">{API_BASE}/health.php</code>{" "}
          directly to see the backend error
        </li>
      </ol>
    </div>
  );
}
