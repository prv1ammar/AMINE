import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { VideoBackground } from "@/components/ui/VideoBackground";
import { ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/features/products/hooks";
import { useSocialImages } from "@/features/socialImages/hooks";
import { useSubscribeNewsletter } from "@/features/newsletter/hooks";
import { ApiError } from "@/lib/apiClient";

const PILLARS = [
  {
    title: "Protection UV400",
    body: "Verres haute définition certifiés, filtre UV400 intégral pour protéger vos yeux toute la journée.",
  },
  {
    title: "Design Intemporel",
    body: "Des formes épurées qui transcendent les saisons et s'adaptent à tous les styles.",
  },
];

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess, error } = useSubscribeNewsletter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutate(email, { onSuccess: () => setEmail("") });
  }

  if (isSuccess) {
    return <p className="form__status--success">Merci — vous êtes inscrit·e à la newsletter.</p>;
  }

  return (
    <>
      <form className="newsletter__form" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder="Votre adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={isPending}>
          {isPending ? "…" : "S'inscrire"}
        </button>
      </form>
      {error && (
        <p className="field__error" style={{ marginTop: 12 }}>
          {error instanceof ApiError ? String(error.detail) : "Une erreur est survenue. Réessayez."}
        </p>
      )}
    </>
  );
}

export function HomePage() {
  const { data: products } = useProducts();
  const featured = products?.slice(0, 3) ?? [];
  const { data: socialImages } = useSocialImages();

  return (
    <>
      <section className="hero">
        <div className="hero__bg">
          <VideoBackground src="/videos/hero.mp4" fit="contain-blur" clipEnd={30} />
        </div>
        <div className="hero__overlay" />
        <div className="hero__content">
          <p className="f1 eyebrow hero__eyebrow">— Lunettes de Soleil • Collection 2024</p>
          <h1 className="f2 serif-xl">L'art de</h1>
          <h1 className="f2 serif-xl">
            <em>voir</em>
          </h1>
          <h1 className="f2 serif-xl">autrement.</h1>
          <div className="f3 hero__actions">
            <Link to="/collection" className="hero__btn-ghost">
              Découvrir la collection
            </Link>
            <Link to="/lookbook" className="hero__link">
              Voir le lookbook →
            </Link>
          </div>
        </div>
      </section>

      <div className="marquee">
        <div className="marquee__track">
          {[0, 1].map((i) => (
            <span key={i}>
              LUNETTES DE SOLEIL &nbsp;✦&nbsp; LHT STORE &nbsp;✦&nbsp; PROTECTION UV400 &nbsp;✦&nbsp; STYLE
              INTEMPOREL &nbsp;✦&nbsp; COLLECTION 2024 &nbsp;✦&nbsp; MADE WITH PASSION &nbsp;✦&nbsp; LUNETTES DE
              SOLEIL &nbsp;✦&nbsp; LHT STORE &nbsp;✦&nbsp; PROTECTION UV400 &nbsp;✦&nbsp; STYLE INTEMPOREL
              &nbsp;✦&nbsp; COLLECTION 2024 &nbsp;✦&nbsp; MADE WITH PASSION &nbsp;✦&nbsp;
            </span>
          ))}
        </div>
      </div>

      <section className="section-band" id="collection">
        <div className="section-band__head">
          <div>
            <p className="eyebrow" style={{ marginBottom: 14 }}>
              01 &nbsp;/&nbsp; Notre Collection
            </p>
            <h2 className="serif-xl">
              Designed to <em>be seen.</em>
            </h2>
          </div>
          <Link to="/collection" className="btn-outline">
            Voir tout
          </Link>
        </div>
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="split" id="lookbook">
        <div className="split__media">
          <ImageSlot
            src="/images/lookbook-couple.jpg"
            placeholder="Lookbook editorial — couple wearing LHT sunglasses"
            alt="Couple portant des lunettes de soleil LHT Store"
          />
        </div>
        <div className="split__copy" style={{ background: "#0a0a0a" }}>
          <p className="eyebrow" style={{ color: "#555" }}>
            02 &nbsp;/&nbsp; Lookbook
          </p>
          <h2 className="serif-xl" style={{ fontSize: "clamp(42px,4.5vw,64px)", color: "#fff" }}>
            Chaque regard <em>raconte</em> une histoire.
          </h2>
          <p style={{ color: "#888" }}>
            Nos lunettes sont conçues pour celles et ceux qui voient le monde différemment. Un style intemporel,
            une protection maximale, un savoir-faire artisanal.
          </p>
          <Link
            to="/lookbook"
            style={{
              fontSize: "8.5px",
              fontWeight: 500,
              letterSpacing: ".38em",
              color: "#fff",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            Découvrir le lookbook <span style={{ display: "block", width: 36, height: 0.5, background: "#fff" }} />
          </Link>
        </div>
      </section>

      <section className="pillars">
        <p className="eyebrow" style={{ marginBottom: 20 }}>
          03 &nbsp;/&nbsp; Notre Promesse
        </p>
        <h2 className="serif-xl" style={{ fontSize: "clamp(40px,4.5vw,60px)", maxWidth: 640, margin: "0 auto 80px" }}>
          <em>Qualité</em>, style &amp; protection — toujours.
        </h2>
        <div className="pillars__grid">
          {PILLARS.map((pillar) => (
            <div className="pillar" key={pillar.title}>
              <p className="pillar__title">{pillar.title}</p>
              <p className="pillar__body">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="quote-band">
        <div className="hero__bg">
          <ImageSlot
            src="/images/quote-band.jpg"
            placeholder="Full-width editorial — model outdoors, summer light, LHT sunglasses"
            alt="Lunettes LHT Store posées sur des pierres, mise en scène éditoriale"
          />
        </div>
        <div className="quote-band__overlay" />
        <blockquote className="quote-band__text">
          <p>"Porter nos lunettes, c'est choisir de voir le monde avec style."</p>
          <p className="quote-band__by">— LHT Store</p>
        </blockquote>
      </section>

      <section className="split">
        <div className="split__copy">
          <p className="eyebrow" style={{ marginBottom: 24 }}>
            04 &nbsp;/&nbsp; Notre Histoire
          </p>
          <h2 className="serif-xl" style={{ fontSize: "clamp(40px,4vw,58px)" }}>
            Nés d'une <em>passion</em> pour le soleil.
          </h2>
          <p>
            LHT Store est né d'une simple conviction : les lunettes de soleil ne sont pas qu'un accessoire de
            protection, elles sont l'expression de votre personnalité.
          </p>
          <p>Chaque modèle de notre collection est sélectionné avec soin pour allier esthétique, confort et haute qualité.</p>
          <Link to="/a-propos" className="btn-dark" style={{ alignSelf: "flex-start" }}>
            Découvrir notre histoire
          </Link>
        </div>
        <div className="split__media">
          <ImageSlot
            src="/images/notre-histoire.jpg"
            placeholder="Brand founder or lifestyle — warm, authentic, sun-filled"
            alt="Portrait éditorial d'un modèle portant des lunettes LHT Store"
          />
        </div>
      </section>

      <section className="social-grid">
        <div className="section-band__head" style={{ marginBottom: 56 }}>
          <div>
            <p className="eyebrow" style={{ color: "#555", marginBottom: 14 }}>
              05 &nbsp;/&nbsp; @lhtstore
            </p>
            <h2 className="serif-xl" style={{ fontSize: "clamp(36px,4vw,52px)", color: "#fff" }}>
              Rejoignez la <em>communauté.</em>
            </h2>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "8.5px", fontWeight: 500, letterSpacing: ".3em", color: "#666", textTransform: "uppercase" }}
          >
            Instagram →
          </a>
        </div>
        <div className="social-grid__images">
          {(socialImages ?? []).map((image) => (
            <div key={image.id}>
              <ImageSlot src={image.image_url} placeholder={image.caption || "Instagram"} />
            </div>
          ))}
        </div>
      </section>

      <section className="newsletter" id="newsletter">
        <p className="eyebrow" style={{ marginBottom: 20 }}>
          Restez informé
        </p>
        <h2 className="serif-xl" style={{ fontSize: "clamp(36px,4.5vw,58px)", maxWidth: 560, margin: "0 auto 16px" }}>
          Ne ratez aucune <em>nouveauté.</em>
        </h2>
        <p style={{ fontSize: 13, fontWeight: 300, color: "#888", marginBottom: 52 }}>
          Inscrivez-vous pour recevoir nos dernières collections, offres exclusives et inspirations.
        </p>
        <NewsletterForm />
      </section>
    </>
  );
}
