import { useEffect, useState } from "react";
import "./AddWineModal.scss";

// Valeurs alignées sur l'enum BDD (couleur), libellés accentués à l'affichage.
const COLORS = [
  { value: "rouge", label: "Rouge" },
  { value: "blanc", label: "Blanc" },
  { value: "rose", label: "Rosé" },
  { value: "effervescent", label: "Effervescent" },
];

const EMPTY = {
  nom: "",
  cepage: "",
  domaine: "",
  millesime: "",
  region: "",
  prix: "",
  couleur: "rouge",
};

/**
 * Modale « Ajouter un Vin » (d'après la maquette tableau blanc).
 * Desktop/tablette : formulaire 2 colonnes ; mobile : champs empilés.
 * Habillage à finaliser avec la maquette définitive ; submit non branché (mock).
 *
 * @param {object}   props
 * @param {() => void} props.onClose  fermeture (croix, Annuler, Échap, clic overlay).
 * @param {(wine: object) => void} [props.onSubmit]  reçoit le formulaire à la validation.
 */
export default function AddWineModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY);

  // Fermeture au clavier (Échap).
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
    onClose?.();
  };

  return (
    <div
      className="add-wine"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-wine-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="add-wine__box">
        <header className="add-wine__head">
          <h2 id="add-wine-title" className="add-wine__title">Ajouter un Vin</h2>
          <button type="button" className="add-wine__close" aria-label="Fermer" onClick={onClose}>
            ×
          </button>
        </header>

        <form className="add-wine__form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nom *</span>
            <input value={form.nom} onChange={update("nom")} required autoFocus />
          </label>
          <label className="field">
            <span>Cépage</span>
            <input value={form.cepage} onChange={update("cepage")} placeholder="Merlot, Cabernet…" />
          </label>
          <label className="field">
            <span>Domaine</span>
            <input value={form.domaine} onChange={update("domaine")} />
          </label>
          <label className="field">
            <span>Millésime</span>
            <input type="number" value={form.millesime} onChange={update("millesime")} placeholder="2021" />
          </label>
          <label className="field">
            <span>Région</span>
            <input value={form.region} onChange={update("region")} />
          </label>
          <label className="field">
            <span>Prix en €</span>
            <input type="number" step="0.01" value={form.prix} onChange={update("prix")} placeholder="18.90" />
          </label>

          <label className="field add-wine__full">
            <span>Couleur</span>
            <select value={form.couleur} onChange={update("couleur")}>
              {COLORS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>

          <footer className="add-wine__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn--primary">Valider</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
