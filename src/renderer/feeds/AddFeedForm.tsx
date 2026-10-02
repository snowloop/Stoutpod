import { useState, type FormEvent } from "react";
import { subscribeToFeed } from "./feedService";

function validateFeedUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "The URL must start with http:// or https://.";
    }
  } catch {
    return "Enter a valid feed URL.";
  }
  return undefined;
}

// IPC rejections arrive prefixed with "Error invoking remote method ...".
function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/^Error invoking remote method '[^']*': (Error: )?/, "");
}

export function AddFeedForm({ onSubscribed }: { onSubscribed: (feedId: string) => void }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = url.trim();

    const validationError = validateFeedUrl(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      const { feed } = await subscribeToFeed(trimmed);
      setUrl("");
      onSubscribed(feed.id);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="add-feed" onSubmit={handleSubmit}>
      <input
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="Podcast RSS feed URL"
        disabled={busy}
        aria-label="Podcast RSS feed URL"
      />
      <button type="submit" disabled={busy || url.trim() === ""}>
        {busy ? "Adding..." : "Add feed"}
      </button>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </form>
  );
}
