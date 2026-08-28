import { Link } from "react-router-dom";
import "./WineCard.scss";

const couleurDot = {
  rouge: "#6b1f2a",
  blanc: "#e6d9a8",
  rosé: "#e3a1a8",
  pétillant: "#d9c98f",
};

/**
 * Carte cuvée. `view` = "grid" | "list" (l'utilisateur choisit le mode
 * d'affichage de sa cave — cf. cahier des charges).
 */
export default function WineCard({ wine, view = "grid" }) {
  return (
    <Link to={`/wine/${wine.id}`} className={`winecard winecard--${view} card`}>
      <div className="winecard__photo">
        {wine.photo ? (
          <img src={wine.photo} alt={wine.nom} />
        ) : (
          <span className="winecard__placeholder">🍷</span>
        )}
      </div>
      <div className="winecard__body">
        <h3 className="winecard__name">{wine.nom}</h3>
        <p className="winecard__producer muted">
          {wine.producteur} · {wine.millesime}
        </p>
        <div className="winecard__meta">
          <span className="winecard__color">
            <span
              className="winecard__dot"
              style={{ background: couleurDot[wine.couleur] || "#ccc" }}
            />
            {wine.region}
          </span>
          <span className="winecard__price">{wine.prix.toFixed(2)} €</span>
        </div>
      </div>
    </Link>
  );
}
