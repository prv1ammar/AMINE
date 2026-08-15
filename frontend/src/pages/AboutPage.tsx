import { Link } from "react-router-dom";
import { ImageSlot } from "@/components/ui/ImageSlot";

export function AboutPage() {
  return (
    <>
      <section className="page-header">
        <p className="eyebrow" style={{ marginBottom: 20 }}>
          Notre Histoire
        </p>
        <h1 className="serif-xl">
          Nés d'une <em>passion</em> pour le soleil.
        </h1>
      </section>

      <section className="split">
        <div className="split__copy">
          <p className="eyebrow">Qui sommes-nous</p>
          <p>
            LHT Store est né d'une simple conviction : les lunettes de soleil ne sont pas qu'un accessoire de
            protection, elles sont l'expression de votre personnalité.
          </p>
          <p>
            Nous sélectionnons chaque modèle avec soin — pas de fast fashion optique, pas de collaboration pour
            faire du bruit. Des montures qui durent, des verres certifiés UV400, et une attention portée aux
            détails que vous finirez par remarquer.
          </p>
          <p>
            Une bonne paire de lunettes, c'est celle que vous portez encore trois ans plus tard parce que vous
            n'avez jamais trouvé mieux.
          </p>
          <Link to="/contact" className="btn-dark" style={{ alignSelf: "flex-start" }}>
            Nous contacter
          </Link>
        </div>
        <div className="split__media">
          <ImageSlot placeholder="Portrait ou lifestyle — chaleureux, authentique, soleil" />
        </div>
      </section>

      <section className="stats-band">
        <div className="stats-band__grid">
          <div className="stat">
            <p className="stat__value">6</p>
            <p className="eyebrow stat__label">Modèles</p>
            <p className="stat__body">Chacun sélectionné pour une raison précise</p>
          </div>
          <div className="stat">
            <p className="stat__value">UV400</p>
            <p className="eyebrow stat__label">Protection</p>
            <p className="stat__body">Certification intégrale sur tous les verres</p>
          </div>
          <div className="stat">
            <p className="stat__value">30j</p>
            <p className="eyebrow stat__label">Retours</p>
            <p className="stat__body">Satisfait ou remboursé, sans condition</p>
          </div>
        </div>
      </section>
    </>
  );
}
