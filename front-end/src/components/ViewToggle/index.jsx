import "./ViewToggle.scss";

/**
 * Sélecteur d'affichage grille / liste, partagé (Accueil, Ma cave…).
 * @param {object} props
 * @param {"grid"|"list"} props.value
 * @param {(v: "grid"|"list") => void} props.onChange
 */
export default function ViewToggle({ value, onChange }) {
  return (
    <div className="view-toggle" role="group" aria-label="Mode d'affichage">
      <button
        className={value === "grid" ? "is-active" : ""}
        onClick={() => onChange("grid")}
        aria-label="Vue grille"
      >
        ▦
      </button>
      <button
        className={value === "list" ? "is-active" : ""}
        onClick={() => onChange("list")}
        aria-label="Vue liste"
      >
        ☰
      </button>
    </div>
  );
}
