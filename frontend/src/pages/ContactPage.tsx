import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCreateInquiry } from "@/features/inquiries/hooks";
import { INQUIRY_SUBJECTS, type InquirySubject } from "@/features/inquiries/types";
import { useProduct } from "@/features/products/hooks";
import { ApiError } from "@/lib/apiClient";

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const productSlug = searchParams.get("modele") ?? undefined;
  const { data: product } = useProduct(productSlug);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [subject, setSubject] = useState<InquirySubject>(
    productSlug ? "Commander un modèle" : INQUIRY_SUBJECTS[0]
  );
  const [message, setMessage] = useState("");

  const isOrder = subject === "Commander un modèle";

  const { mutate, isPending, isSuccess, error, reset } = useCreateInquiry();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutate(
      {
        name,
        email,
        phone: phone || null,
        address: address || null,
        subject,
        message,
        product_slug: productSlug ?? null,
      },
      {
        onSuccess: () => {
          setName("");
          setEmail("");
          setPhone("");
          setAddress("");
          setMessage("");
        },
      }
    );
  }

  return (
    <>
      <section className="page-header">
        <p className="eyebrow" style={{ marginBottom: 20 }}>
          Contact &amp; Commandes
        </p>
        <h1 className="serif-xl">
          Dites-nous ce que vous <em>cherchez.</em>
        </h1>
      </section>

      <section className="contact-layout">
        <div className="contact-layout__aside">
          {product && (
            <div>
              <p className="eyebrow" style={{ marginBottom: 12 }}>
                Modèle sélectionné
              </p>
              <p style={{ fontFamily: "var(--display)", fontSize: 22 }}>{product.name}</p>
            </div>
          )}
          <div>
            <p className="eyebrow" style={{ marginBottom: 12 }}>
              Email direct
            </p>
            <a href="mailto:hello@lhtstore.com" style={{ fontFamily: "var(--display)", fontSize: 22 }}>
              hello@lhtstore.com
            </a>
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 12 }}>
              Réponse
            </p>
            <p className="field__hint">
              Sous 24 heures ouvrées. Précisez le modèle souhaité et votre adresse de livraison pour accélérer le
              traitement.
            </p>
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 12 }}>
              Suivre
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 300, color: "#666" }}>
                Instagram →
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 300, color: "#666" }}>
                TikTok →
              </a>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div>
            <p className="form__status--success">
              Merci — votre message est bien parti. On revient vers vous sous 24 heures ouvrées.
            </p>
            <button type="button" className="btn-dark" style={{ marginTop: 24 }} onClick={() => reset()}>
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <form className="contact-layout__form" onSubmit={handleSubmit}>
            <div className="contact-layout__row">
              <div>
                <label htmlFor="nom">Nom</label>
                <input id="nom" type="text" name="nom" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" name="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="sujet">Sujet</label>
              <select id="sujet" name="sujet" value={subject} onChange={(e) => setSubject(e.target.value as InquirySubject)}>
                {INQUIRY_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {isOrder && (
              <div className="contact-layout__row">
                <div>
                  <label htmlFor="phone">Téléphone</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="address">Adresse de livraison</label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    autoComplete="street-address"
                    required
                    placeholder="Numéro, rue, ville, code postal"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div>
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" required value={message} onChange={(e) => setMessage(e.target.value)} />
              {isOrder && (
                <p className="field__hint" style={{ marginTop: 8 }}>
                  Précisez le modèle, la couleur si disponible, et toute autre information utile à la livraison.
                </p>
              )}
            </div>
            {error && (
              <p className="field__error">
                {error instanceof ApiError ? String(error.detail) : "Une erreur est survenue. Réessayez."}
              </p>
            )}
            <button type="submit" className="btn-dark" style={{ justifySelf: "start" }} disabled={isPending}>
              {isPending ? "Envoi…" : "Envoyer"}
            </button>
          </form>
        )}
      </section>
    </>
  );
}
