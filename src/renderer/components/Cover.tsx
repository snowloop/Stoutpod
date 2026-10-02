import { useState } from "react";

type CoverProps = {
  src: string | undefined;
  title: string;
  size: number
};

export function Cover({ src, title, size
 }: CoverProps) {
  // Remember the URL that failed so a new src gets a fresh attempt.
  const [failedSrc, setFailedSrc] = useState<string>();

  if (!src || failedSrc === src) {
    return (
      <div
        aria-hidden="true"
        className="cover cover-placeholder"
        style={{ width: size, height: size, fontSize: size / 2 }}
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
      className="cover"
      width={size}
      height={size}
      onError={() => setFailedSrc(src)}
    />
  );
}
