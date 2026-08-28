import { useState } from "react";
import AddWineModal from "../../../components/AddWineModal";

/**
 * Admin — ajout d'une cuvée via la modale « Ajouter un Vin ».
 * Enrichit la base locale ET la base globale (cf. cahier des charges).
 * Submit non encore branché au back (mock).
 */
export default function AddWine() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="container">
      <h1>Ajouter une cuvée</h1>
      <p className="muted">
        La cuvée sera ajoutée à votre cave et à la base collective de l'application.
      </p>

      <button className="btn btn--primary" onClick={() => setOpen(true)}>
        + Ajouter un vin
      </button>

      {saved && (
        <p style={{ color: "var(--success)", marginTop: "var(--sp-4)" }}>
          ✔ Cuvée enregistrée (maquette).
        </p>
      )}

      {open && (
        <AddWineModal
          onClose={() => setOpen(false)}
          onSubmit={(wine) => {
            console.log("Nouveau vin (mock) :", wine);
            setSaved(true);
          }}
        />
      )}
    </div>
  );
}
