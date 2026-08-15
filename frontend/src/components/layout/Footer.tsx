import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} LHT Store. Tous droits réservés.</p>
      <div className="site-footer__links">
        <Link to="/">Accueil</Link>
        <Link to="/collection">Collection</Link>
        <Link to="/lookbook">Lookbook</Link>
        <Link to="/a-propos">À Propos</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <p className="site-footer__tagline">Lunettes de Soleil • Paris</p>
    </footer>
  );
}
