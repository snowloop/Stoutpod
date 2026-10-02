import { useState } from "react";

type CoverProps = {
  src: string | undefined;
  title: string;
  size: number;
};

export function Cover({ src, title, size }: CoverProps) {
  // Remember the URL that failed so a new src gets a fresh attempt.
  const [failedSrc, setFailedSrc] = useState<string>();
  const box = { width: size, height: size, flexShrink: 0, borderRadius: 4 } as const;

  if (!src || failedSrc === src) {
    return (
      <div
        aria-hidden="true"
        style={{
          ...box,
          display: "grid",
          placeItems: "center",
          background: "GrayText",
          color: "Canvas",
          fontWeight: "bold",
          fontSize: size / 2,
        }}
      >
        {title.trim().charAt(0).toUpperCase() || "?"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      style={{ ...box, objectFit: "cover" }}
    />
  );
}
