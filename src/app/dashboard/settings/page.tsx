import { EmbedSnippet } from "@/components/dashboard/embed-snippet";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Embed SDK</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Install the tracking snippet on your checkout page.
        </p>
      </div>
      <EmbedSnippet />
    </div>
  );
}
