import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { useCart } from "@/features/cart/CartContext";
import { useCreateInquiry } from "@/features/inquiries/hooks";
import { formatPrice } from "@/features/products/types";
import { ApiError } from "@/lib/apiClient";
import { toMediaUrl } from "@/lib/apiClient";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", minimumFractionDigits: 0 }).format(
    cents / 100
  );
}

function DeliveryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 7h11v9H2z M13 10h5l4 3.5V16h-9z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="6.5" cy="17.5" r="1.6" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <circle cx="17.5" cy="17.5" r="1.6" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

export function CheckoutPage() {
  const { items, subtotalCents, clear } = useCart();
  // Estimate shown before submitting — the server recomputes this from the DB
  // at checkout time and that authoritative value is what's actually charged.
  const deliveryCents = items.reduce((max, line) => Math.max(max, line.product.delivery_price_cents ?? 0), 0);
  const grandTotalCents = subtotalCents + deliveryCents;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  const { mutate, isPending, isSuccess, data, error } = useCreateInquiry();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutate(
      {
        name,
        email,
        phone,
        address,
        subject: "Commander un modèle",
        message,
        product_slug: null,
        items: items.map((line) => ({ product_id: line.product.id, quantity: line.quantity })),
      },
      { onSuccess: () => clear() }
    );
  }

  if (isSuccess) {
    return (
      <section className="page-header">
        <p className="eyebrow" style={{ marginBottom: 20 }}>
          Commande envoyée
        </p>
        <h1 className="serif-xl">
          Merci, <em>{data.name}</em>.
        </h1>
        <p className="field__hint" style={{ marginTop: 24, maxWidth: 480 }}>
          Votre commande de {formatCents((data.total_cents ?? 0) + (data.delivery_cents ?? 0))} (livraison incluse)
          est bien enregistrée. Nous revenons vers vous sous 24 heures ouvrées avec un lien de paiement sécurisé.
        </p>
        <Link to="/collection" className="btn-dark" style={{ marginTop: 32, display: "inline-block" }}>
          Continuer mes achats
        </Link>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="page-header">
        <p className="eyebrow" style={{ marginBottom: 20 }}>
          Commande
        </p>
        <h1 className="serif-xl">
          Votre panier est <em>vide.</em>
        </h1>
        <Link to="/collection" className="btn-dark" style={{ marginTop: 32, display: "inline-block" }}>
          Découvrir la collection
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="page-header">
        <p className="eyebrow" style={{ marginBottom: 20 }}>
          Commande
        </p>
        <h1 className="serif-xl">
          Finalisez votre <em>commande.</em>
        </h1>
      </section>

      <section className="contact-layout">
        <div className="contact-layout__aside">
          <p className="eyebrow" style={{ marginBottom: 12 }}>
            Votre panier
          </p>
          <div className="checkout-summary">
            {items.map((line) => (
              <div className="checkout-summary__row" key={line.product.id}>
                <div className="checkout-summary__thumb">
                  <ImageSlot
                    src={toMediaUrl(line.product.image_url)}
                    placeholder={line.product.image_placeholder}
                    alt={line.product.name}
                  />
                </div>
                <div className="checkout-summary__info">
                  <p className="checkout-summary__name">{line.product.name}</p>
                  <p className="checkout-summary__meta">
                    {line.quantity} × {formatPrice(line.product)}
                  </p>
                </div>
                <p className="checkout-summary__total">
                  {formatCents(line.product.price_cents * line.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="checkout-delivery">
            <span className="checkout-delivery__icon">
              <DeliveryIcon />
            </span>
            <span className="checkout-delivery__label">Livraison</span>
            <span className="checkout-delivery__price">
              {deliveryCents > 0 ? formatCents(deliveryCents) : "Offerte"}
            </span>
          </div>

          <div className="checkout-summary__grand-total">
            <span>Total</span>
            <span>{formatCents(grandTotalCents)}</span>
          </div>
        </div>

        <form className="contact-layout__form" onSubmit={handleSubmit}>
          <div className="contact-layout__row">
            <div>
              <label htmlFor="co-nom">Nom</label>
              <input id="co-nom" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="co-email">Email</label>
              <input id="co-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="contact-layout__row">
            <div>
              <label htmlFor="co-phone">Téléphone</label>
              <input id="co-phone" type="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label htmlFor="co-address">Adresse de livraison</label>
              <input
                id="co-address"
                type="text"
                autoComplete="street-address"
                required
                placeholder="Numéro, rue, ville, code postal"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="co-message">Note (optionnel)</label>
            <textarea
              id="co-message"
              placeholder="Couleur souhaitée, instructions de livraison…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          {error && (
            <p className="field__error">
              {error instanceof ApiError ? String(error.detail) : "Une erreur est survenue. Réessayez."}
            </p>
          )}
          <button type="submit" className="btn-dark" style={{ justifySelf: "start" }} disabled={isPending}>
            {isPending ? "Envoi…" : `Confirmer — ${formatCents(grandTotalCents)}`}
          </button>
        </form>
      </section>
    </>
  );
}
