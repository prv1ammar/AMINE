import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="page-header">
      <h1 className="serif-xl">
        Cette page n'existe <em>pas.</em>
      </h1>
      <p style={{ marginTop: 20 }}>
        <Link to="/" className="btn-dark">
          Retour à l'accueil
        </Link>
      </p>
    </section>
  );
}
