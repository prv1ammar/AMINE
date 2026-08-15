import { Link } from "react-router-dom";
import { useProducts } from "@/features/products/hooks";
import { formatPrice } from "@/features/products/types";

const PACKAGES = [
  {
    slug: "le-minimaliste",
    name: "Le Minimaliste",
    note: "livraison incluse",
    lead: false,
    features: [
      "Monture cat-eye épurée",
      "Verres polycarbonate haute définition",
      "Protection UV400 certifiée",
      "Étui rigide + chiffon microfibre",
    ],
  },
  {
    slug: "laviateur",
    name: "L'Aviateur",
    note: "le plus choisi",
    lead: true,
    features: [
      "Monture aviateur double pont",
      "Verres minéraux traités anti-reflets",
      "Protection UV400 certifiée",
      "Charnières à ressort renforcées",
      "Étui rigide cuir synthétique + chiffon",
    ],
  },
  {
    slug: "le-classique",
    name: "Le Classique",
    note: "livraison incluse",
    lead: false,
    features: [
      "Monture rectangle intemporelle",
      "Verres polycarbonate haute définition",
      "Protection UV400 certifiée",
      "Disponible en noir et en écaille",
      "Étui rigide + chiffon microfibre",
    ],
  },
];

const STAGES = [
  {
    title: "Choisir son modèle",
    body: "Parcourez la collection. En cas de doute entre deux modèles, écrivez-nous — on répond sous 24 heures.",
  },
  {
    title: "Passer commande",
    body: "Via le formulaire de contact ou par email. Précisez le modèle, la couleur si disponible, et votre adresse. On confirme sous 24 heures.",
  },
  {
    title: "Paiement sécurisé",
    body: "Lien de paiement envoyé par email. Carte bancaire ou virement. Aucune donnée bancaire stockée de notre côté.",
  },
  {
    title: "Expédition",
    body: "Expédié sous 48 heures ouvrées après paiement. Livraison France métropolitaine en 2 à 4 jours, avec numéro de suivi.",
  },
  {
    title: "Retours",
    body: "30 jours pour changer d'avis, sans questions. Retour gratuit si le produit est défectueux. Remboursement sous 5 jours ouvrés.",
  },
];

export function TarifsPage() {
  const { data: products } = useProducts();
  const priceFor = (slug: string) => products?.find((p) => p.slug === slug);

  return (
    <>
      <section className="page-header">
        <p className="eyebrow" style={{ marginBottom: 20 }}>
          Tarifs &amp; Commande
        </p>
        <h1 className="serif-xl">
          Des prix clairs, sans <em>surprise.</em>
        </h1>
      </section>

      <section style={{ padding: "80px 64px" }}>
        <div className="package-grid">
          {PACKAGES.map((pkg) => {
            const product = priceFor(pkg.slug);
            return (
              <article className={pkg.lead ? "package-card package-card--lead" : "package-card"} key={pkg.slug}>
                <p className="eyebrow">
                  {product ? formatPrice(product) : "—"} · {pkg.note}
                </p>
                <h2 className="package-card__name">{pkg.name}</h2>
                <ul className="package-card__list">
                  {pkg.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link to={`/contact?modele=${pkg.slug}`} className="btn-outline" style={{ alignSelf: "flex-start" }}>
                  Commander
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section style={{ padding: "0 64px 120px" }}>
        <div className="section-band__head">
          <h2 className="serif-xl" style={{ fontSize: "clamp(40px,4.5vw,60px)" }}>
            Comment ça <em>fonctionne.</em>
          </h2>
          <p className="eyebrow">Cinq étapes simples</p>
        </div>
        <div className="process-list">
          {STAGES.map((stage) => (
            <div className="process-step" key={stage.title}>
              <div>
                <h3 className="process-step__title">{stage.title}</h3>
                <p className="process-step__body">{stage.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-band" style={{ paddingBlock: 100 }}>
        <blockquote style={{ maxWidth: "46rem", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: "clamp(24px,3vw,36px)", color: "#fff", marginBottom: 20 }}>
            « Je portais mes lunettes depuis deux ans quand j'ai commandé une deuxième paire — c'est la meilleure
            preuve que je pouvais donner. »
          </p>
          <p className="eyebrow" style={{ color: "#666" }}>
            Camille R. · Paris, 2024
          </p>
        </blockquote>
      </section>
    </>
  );
}
