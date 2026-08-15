interface ImageSlotProps {
  placeholder: string;
  src?: string | null;
  alt?: string;
}

/** Stands in for real product/editorial photography until it's shot and uploaded. */
export function ImageSlot({ placeholder, src, alt }: ImageSlotProps) {
  if (src) {
    return <img src={src} alt={alt ?? placeholder} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  }
  return (
    <div className="image-slot" role="img" aria-label={placeholder}>
      <span className="image-slot__caption">{placeholder}</span>
    </div>
  );
}
