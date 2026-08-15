import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "@/features/cart/CartContext";
import { Logo } from "./Logo";

const LINKS = [
  { to: "/collection", label: "Collection" },
  { to: "/lookbook", label: "Lookbook" },
  { to: "/a-propos", label: "À Propos" },
];

function CartIcon() {
  const { count, toggleCart } = useCart();
  return (
    <button type="button" className="site-nav__cart" aria-label="Ouvrir le panier" onClick={toggleCart}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {count > 0 && <span className="site-nav__cart-badge">{count}</span>}
    </button>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav className="site-nav">
      <div className="site-nav__side site-nav__side--left">
        <div className="site-nav__group site-nav__group--desktop">
          <NavLink to="/collection">Collection</NavLink>
          <NavLink to="/lookbook">Lookbook</NavLink>
        </div>
      </div>

      <NavLink to="/" className="site-nav__logo">
        <Logo />
        <span className="site-nav__logo-word">LHT</span>
        <div className="site-nav__logo-sub">
          <i />
          <span>Store</span>
          <i />
        </div>
      </NavLink>

      <div className="site-nav__side site-nav__side--right">
        <div className="site-nav__group site-nav__group--desktop">
          <NavLink to="/a-propos">À Propos</NavLink>
          <NavLink to="/contact" className="site-nav__cta">
            Shop
          </NavLink>
        </div>

        <div className="site-nav__actions">
          <CartIcon />
          <button
            type="button"
            className={`site-nav__toggle${open ? " site-nav__toggle--open" : ""}`}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && (
        <div className="site-nav__mobile" role="dialog" aria-modal="true">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/contact" className="site-nav__mobile-cta" onClick={() => setOpen(false)}>
            Shop
          </NavLink>
        </div>
      )}
    </nav>
  );
}
