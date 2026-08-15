import { NavLink, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/features/admin/AdminAuthContext";
import "@/styles/admin.css";

const LINKS = [
  { to: "/admin/produits", label: "Produits" },
  { to: "/admin/collections", label: "Collections" },
  { to: "/admin/lookbook", label: "Lookbook" },
  { to: "/admin/demandes", label: "Demandes" },
  { to: "/admin/newsletter", label: "Newsletter" },
  { to: "/admin/instagram", label: "Instagram" },
];

export function AdminLayout() {
  const { logout } = useAdminAuth();

  return (
    <div className="admin admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__mark">LHT</div>
          <span className="admin-sidebar__brand-text">
            Store
            <span className="admin-sidebar__brand-sub">Administration</span>
          </span>
        </div>
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} className="admin-sidebar__link">
            {link.label}
          </NavLink>
        ))}
        <div className="admin-sidebar__spacer" />
        <a className="admin-sidebar__view-site" href="/" target="_blank" rel="noreferrer">
          Voir le site →
        </a>
        <button type="button" className="admin-sidebar__logout" onClick={logout}>
          Se déconnecter
        </button>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
