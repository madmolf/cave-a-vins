import "./Avatar.scss";

/** Déduit 1–2 initiales à partir d'un nom ou d'un email. */
function getInitials(name = "") {
  const base = name.split("@")[0]; // si c'est un email, on garde la partie locale
  const parts = base.split(/[.\-_\s]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "");
  return letters.toUpperCase() || "?";
}

/**
 * Avatar utilisateur : affiche la photo si fournie, sinon un fallback à initiales.
 * @param {object} props
 * @param {string} [props.photo]  URL / dataURL de la photo.
 * @param {string} [props.name]   nom ou email (pour les initiales et l'alt).
 * @param {number} [props.size]   diamètre en px.
 */
export default function Avatar({ photo, name = "", size = 64 }) {
  const style = { width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.38}px` };

  return (
    <span className="avatar" style={style}>
      {photo ? (
        <img src={photo} alt={name ? `Avatar de ${name}` : "Avatar"} />
      ) : (
        <span className="avatar__initials">{getInitials(name)}</span>
      )}
    </span>
  );
}
