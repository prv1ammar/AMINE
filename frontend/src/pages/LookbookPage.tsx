import { Link } from "react-router-dom";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { useLookbookEntries } from "@/features/lookbookEntries/hooks";
import { toMediaUrl } from "@/lib/apiClient";

export function LookbookPage() {
  const { data: entries } = useLookbookEntries();

  return (
    <>
      <section className="page-header">
        <p className="eyebrow" style={{ marginBottom: 20 }}>
          Lookbook 2024
        </p>
        <h1 className="serif-xl">
          Chaque regard <em>raconte</em> une histoire.
        </h1>
      </section>

      <section className="lookbook-entries">
        {(entries ?? []).map((entry, i) => {
          const reverse = i % 2 === 1;
          return (
            <article className="lookbook-entry" key={entry.id}>
              <div className={`lookbook-entry__media${reverse ? " lookbook-entry__media--reverse" : ""}`}>
                <ImageSlot
                  src={toMediaUrl(entry.image_url)}
                  placeholder={entry.image_placeholder}
                  alt={entry.title}
                />
              </div>
              <div className="lookbook-entry__copy">
                <p className="eyebrow">{entry.eyebrow}</p>
                <h2 className="serif-xl">{entry.title}</h2>
                <p>{entry.body}</p>
                <Link to={entry.link_url} className="lookbook-entry__link">
                  Voir le modèle <span />
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
