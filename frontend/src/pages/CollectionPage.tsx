import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/product/ProductCard";
import { useCollection, useCollections } from "@/features/collections/hooks";
import { useProducts } from "@/features/products/hooks";

export function CollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get("theme");

  const { data: collections } = useCollections();
  const { data: allProducts, isLoading: loadingAll, isError: errorAll } = useProducts();
  const {
    data: themedCollection,
    isLoading: loadingThemed,
    isError: errorThemed,
  } = useCollection(activeSlug ?? undefined);

  const isLoading = activeSlug ? loadingThemed : loadingAll;
  const isError = activeSlug ? errorThemed : errorAll;
  const products = activeSlug ? themedCollection?.products : allProducts;

  function selectTheme(slug: string | null) {
    if (slug) {
      setSearchParams({ theme: slug });
    } else {
      setSearchParams({});
    }
  }

  return (
    <>
      <section className="page-header">
        <p className="eyebrow" style={{ marginBottom: 20 }}>
          Collection 2024
        </p>
        <h1 className="serif-xl">
          Designed to <em>be seen.</em>
        </h1>
      </section>

      {!!collections?.length && (
        <nav
          aria-label="Filtrer par collection"
          style={{ display: "flex", flexWrap: "wrap", gap: 24, padding: "32px 64px 0" }}
        >
          <button
            type="button"
            onClick={() => selectTheme(null)}
            className="eyebrow"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: activeSlug ? undefined : "var(--ink)",
            }}
          >
            Tout voir
          </button>
          {collections.map((collection) => (
            <button
              key={collection.id}
              type="button"
              onClick={() => selectTheme(collection.slug)}
              className="eyebrow"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: activeSlug === collection.slug ? "var(--ink)" : undefined,
              }}
            >
              {collection.name}
            </button>
          ))}
        </nav>
      )}

      <section style={{ padding: "48px 64px 120px" }}>
        {isLoading && <p className="eyebrow">Chargement de la collection…</p>}
        {isError && <p className="field__error">Impossible de charger la collection pour le moment.</p>}
        {products && !products.length && <p className="eyebrow">Aucun produit dans cette collection pour le moment.</p>}
        {!!products?.length && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
