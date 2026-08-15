import { SyntheticEvent } from "react";

interface VideoBackgroundProps {
  src: string;
  poster?: string;
  /**
   * "cover" fills the frame and crops — fine for landscape source video.
   * "contain-blur" shows the full frame uncropped (e.g. portrait/vertical clips),
   * padded with a blurred copy of the same video instead of empty bars.
   */
  fit?: "cover" | "contain-blur";
  /** Loop only the first N seconds of the clip instead of the whole thing. */
  clipEnd?: number;
}

function makeClipHandler(clipEnd?: number) {
  if (!clipEnd) return undefined;
  return (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (video.currentTime >= clipEnd) {
      video.currentTime = 0;
    }
  };
}

/** A muted, looping background video. */
export function VideoBackground({ src, poster, fit = "cover", clipEnd }: VideoBackgroundProps) {
  const onTimeUpdate = makeClipHandler(clipEnd);

  if (fit === "contain-blur") {
    return (
      <div className="video-bg-wrap">
        <video
          className="video-bg video-bg--blur"
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          onTimeUpdate={onTimeUpdate}
        />
        <video
          className="video-bg video-bg--contain"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onTimeUpdate={onTimeUpdate}
        />
      </div>
    );
  }

  return (
    <video
      className="video-bg"
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onTimeUpdate={onTimeUpdate}
    />
  );
}
