import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { useCart } from "@/features/cart/CartContext";
import { useProduct } from "@/features/products/hooks";
import { formatPrice } from "@/features/products/types";
import { toMediaUrl } from "@/lib/apiClient";
import { NotFoundPage } from "./NotFoundPage";

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useProduct(slug);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading) return null;
  if (isError || !product) return <NotFoundPage />;

  function handleAddToCart() {
    addItem(product!, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <section className="split product-detail">
      <div className="split__media">
        <ImageSlot src={toMediaUrl(product.image_url)} placeholder={product.image_placeholder} alt={product.name} />
        {product.badge && (
          <span className={`product-card__badge${product.badge.toLowerCase() === "bestseller" ? " product-card__badge--outline" : ""}`}>
            {product.badge}
          </span>
        )}
      </div>
      <div className="split__copy">
        <Link to="/collection" className="product-detail__back">
          ← Retour à la collection
        </Link>
        <p className="eyebrow">
          {product.shape} • UV400
        </p>
        <h1 className="serif-xl">{product.name}</h1>
        <p className="product-detail__price">{formatPrice(product)}</p>
        {product.tagline && <p className="product-detail__tagline">{product.tagline}</p>}
        {product.description && <p>{product.description}</p>}

        <div className="product-detail__actions">
          <div className="qty-stepper">
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity((q) => Math.min(20, q + 1))}>
              +
            </button>
          </div>
          <button type="button" className="btn-dark" onClick={handleAddToCart}>
            {added ? "Ajouté ✓" : "Ajouter au panier"}
          </button>
        </div>
      </div>
    </section>
  );
}
