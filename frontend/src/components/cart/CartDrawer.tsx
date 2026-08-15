import { Link } from "react-router-dom";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { useCart } from "@/features/cart/CartContext";
import { formatPrice } from "@/features/products/types";
import { toMediaUrl } from "@/lib/apiClient";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", minimumFractionDigits: 0 }).format(
    cents / 100
  );
}

export function CartDrawer() {
  const { items, subtotalCents, isOpen, closeCart, removeItem, setQuantity } = useCart();

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={closeCart}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="cart-drawer__head">
          <p className="cart-drawer__title">Panier ({items.reduce((n, l) => n + l.quantity, 0)})</p>
          <button type="button" className="cart-drawer__close" aria-label="Fermer le panier" onClick={closeCart}>
            ✕
          </button>
        </div>

        {!items.length ? (
          <div className="cart-drawer__empty">
            <p>Votre panier est vide.</p>
            <Link to="/collection" className="btn-outline" onClick={closeCart}>
              Découvrir la collection
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {items.map((line) => (
                <div className="cart-drawer__item" key={line.product.id}>
                  <div className="cart-drawer__item-thumb">
                    <ImageSlot
                      src={toMediaUrl(line.product.image_url)}
                      placeholder={line.product.image_placeholder}
                      alt={line.product.name}
                    />
                  </div>
                  <div className="cart-drawer__item-body">
                    <p className="cart-drawer__item-name">{line.product.name}</p>
                    <p className="cart-drawer__item-price">{formatPrice(line.product)}</p>
                    <div className="cart-drawer__item-row">
                      <div className="qty-stepper">
                        <button type="button" onClick={() => setQuantity(line.product.id, line.quantity - 1)}>
                          −
                        </button>
                        <span>{line.quantity}</span>
                        <button type="button" onClick={() => setQuantity(line.product.id, line.quantity + 1)}>
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-drawer__remove"
                        onClick={() => removeItem(line.product.id)}
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer__footer">
              <div className="cart-drawer__subtotal">
                <span>Sous-total</span>
                <span>{formatCents(subtotalCents)}</span>
              </div>
              <Link to="/commande" className="btn-dark cart-drawer__checkout" onClick={closeCart}>
                Passer la commande
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
