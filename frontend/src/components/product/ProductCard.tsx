import { useState } from "react";
import { Link } from "react-router-dom";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { useCart } from "@/features/cart/CartContext";
import { formatPrice, type Product } from "@/features/products/types";
import { toMediaUrl } from "@/lib/apiClient";

export function ProductCard({ product }: { product: Product }) {
  const badgeIsOutline = product.badge?.toLowerCase() === "bestseller";
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="product-card">
      <Link to={`/produit/${product.slug}`} className="product-card__frame">
        <ImageSlot placeholder={product.image_placeholder} src={toMediaUrl(product.image_url)} alt={product.name} />
        {product.badge && (
          <span className={`product-card__badge${badgeIsOutline ? " product-card__badge--outline" : ""}`}>
            {product.badge}
          </span>
        )}
      </Link>
      <div className="product-card__row">
        <div>
          <Link to={`/produit/${product.slug}`} className="product-card__name-link">
            <p className="product-card__name">{product.name}</p>
          </Link>
          <p className="product-card__meta">
            {product.shape} • UV400
          </p>
        </div>
        <p className="product-card__price">{formatPrice(product)}</p>
      </div>
      <button type="button" className="btn-outline" onClick={handleAddToCart}>
        {added ? "Ajouté ✓" : "Ajouter au panier"}
      </button>
    </div>
  );
}
