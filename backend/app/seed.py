"""Seed the database with the LHT Store catalog. Run with: python -m app.seed"""

from app.crud.collection import add_product_to_collection
from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.models.collection import Collection
from app.models.product import Product

PRODUCTS = [
    dict(
        slug="le-classique",
        name="Le Classique",
        shape="Rectangle",
        price_cents=8900,
        tagline="Monture rectangle intemporelle",
        description=(
            "Une monture rectangle qui traverse les saisons sans jamais dater. "
            "Verres polycarbonate haute définition, disponible en noir et en écaille."
        ),
        image_placeholder="Product shot — Le Classique, sunglasses rectangle",
        badge="Nouveau",
        is_new=True,
        sort_order=1,
    ),
    dict(
        slug="laviateur",
        name="L'Aviateur",
        shape="Aviator",
        price_cents=9500,
        tagline="Monture aviateur double pont, le plus choisi",
        description=(
            "Le modèle le plus commandé de la collection. Verres minéraux traités "
            "anti-reflets, charnières à ressort renforcées, étui cuir synthétique inclus."
        ),
        image_placeholder="Product shot — L'Aviateur, aviator sunglasses",
        badge="Bestseller",
        is_bestseller=True,
        sort_order=2,
    ),
    dict(
        slug="le-minimaliste",
        name="Le Minimaliste",
        shape="Cat-Eye",
        price_cents=7900,
        tagline="Cat-eye discret, profil rasant",
        description="Pour ceux qui comprennent que le style le plus affirmé est celui qu'on ne crie pas.",
        image_placeholder="Product shot — Le Minimaliste, cat-eye",
        sort_order=3,
    ),
    dict(
        slug="le-cargo",
        name="Le Cargo",
        shape="Oversized",
        price_cents=8900,
        tagline="Grand format, présence assumée",
        description="Oversized sans excès, en acétate fumé — fonctionne quand tout le reste disparaît dans l'hiver.",
        image_placeholder="Product shot — Le Cargo, oversized sunglasses",
        sort_order=4,
    ),
    dict(
        slug="la-capsule",
        name="La Capsule",
        shape="Round",
        price_cents=8500,
        tagline="Round, capsule collection",
        description="La forme ronde de la collection, pensée pour la capsule printemps.",
        image_placeholder="Product shot — La Capsule, round sunglasses",
        sort_order=5,
    ),
    dict(
        slug="lurbain",
        name="L'Urbain",
        shape="Wayfarer",
        price_cents=8200,
        tagline="Wayfarer urbain",
        description="Une wayfarer pensée pour la ville, en toute circonstance.",
        image_placeholder="Product shot — L'Urbain, wayfarer sunglasses",
        sort_order=6,
    ),
]

COLLECTIONS = [
    dict(
        slug="ete-2024",
        name="Été 2024",
        description="La sélection pensée pour la lumière de fin d'après-midi et les journées longues.",
        image_placeholder="Editorial — été, lumière dorée",
        sort_order=1,
        product_slugs=["le-classique", "laviateur", "la-capsule"],
    ),
    dict(
        slug="bestsellers",
        name="Bestsellers",
        description="Les modèles les plus commandés, saison après saison.",
        image_placeholder="Editorial — collection bestsellers",
        sort_order=2,
        product_slugs=["laviateur", "le-classique", "le-cargo"],
    ),
    dict(
        slug="capsule-printemps",
        name="Capsule Printemps",
        description="Une capsule courte, pensée pour les silhouettes discrètes.",
        image_placeholder="Editorial — capsule printemps",
        sort_order=3,
        product_slugs=["le-minimaliste", "la-capsule"],
    ),
]


def seed() -> None:
    init_db()
    db = SessionLocal()
    try:
        existing_slugs = {p.slug for p in db.query(Product.slug).all()}
        created = 0
        for data in PRODUCTS:
            if data["slug"] in existing_slugs:
                continue
            db.add(Product(**data))
            created += 1
        db.commit()
        print(f"Seed complete — {created} product(s) created, {len(PRODUCTS) - created} already present.")

        existing_collection_slugs = {c.slug for c in db.query(Collection.slug).all()}
        collections_created = 0
        for data in COLLECTIONS:
            if data["slug"] in existing_collection_slugs:
                continue
            product_slugs = data.pop("product_slugs")
            collection = Collection(**data)
            db.add(collection)
            db.commit()
            db.refresh(collection)
            for position, slug in enumerate(product_slugs):
                product = db.query(Product).filter(Product.slug == slug).first()
                if product:
                    add_product_to_collection(db, collection.id, product.id, position)
            collections_created += 1
        print(
            f"Seed complete — {collections_created} collection(s) created, "
            f"{len(COLLECTIONS) - collections_created} already present."
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed()
