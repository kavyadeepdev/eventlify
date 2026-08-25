"use client";

import { useRef, useState } from "react";
import { ImagePlus, RotateCcw } from "lucide-react";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PicturePickerProps {
  name: string;
  /** The Google account picture, offered as the default. */
  defaultImage: string | null;
  value: string;
  onChange: (value: string) => void;
}

const OUTPUT_SIZE = 256;
const MAX_INPUT_BYTES = 8 * 1024 * 1024;

/**
 * Picks a profile picture. Uploads are cropped square and re-encoded to a
 * small JPEG data URL in the browser, so a picture can be stored on the user
 * row without needing a file-storage service.
 */
export default function PicturePicker({
  name,
  defaultImage,
  value,
  onChange,
}: PicturePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Pick an image file.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("That file is over 8MB — pick a smaller one.");
      return;
    }

    setBusy(true);
    try {
      onChange(await toSquareDataUrl(file));
    } catch {
      setError("Couldn't read that image. Try a different one.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl border-[3px] border-ink bg-grape">
          {value ? (
            // Data URLs and remote URLs both render fine here; the optimiser
            // can't handle inline data, so use a plain img for both.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="display grid size-full place-items-center text-2xl text-white">
              {initials(name)}
            </span>
          )}
        </span>

        <div className="min-w-0 space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-zest px-4 py-2 text-xs font-bold uppercase tracking-wide",
              "shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            )}
          >
            <ImagePlus className="size-4" />
            {busy ? "Processing…" : value ? "Change picture" : "Upload picture"}
          </button>

          {defaultImage && value !== defaultImage ? (
            <button
              type="button"
              onClick={() => onChange(defaultImage)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground underline decoration-dashed underline-offset-4 hover:text-ink"
            >
              <RotateCcw className="size-3.5" />
              Use my Google picture
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      <input type="hidden" name="image" value={value} />

      {error ? (
        <p role="alert" className="text-xs font-semibold text-flame">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Centre-crops to a square and re-encodes small enough to store inline. */
async function toSquareDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");

  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE
  );
  bitmap.close();

  // Step the quality down until it comfortably fits the column.
  for (const quality of [0.82, 0.7, 0.6, 0.5]) {
    const url = canvas.toDataURL("image/jpeg", quality);
    if (url.length <= 300_000) return url;
  }
  return canvas.toDataURL("image/jpeg", 0.4);
}
