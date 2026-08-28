import { Link, useParams } from "react-router-dom";
import { getWineById } from "../../data/wines";
import "./WineDetail.scss";

export default function WineDetail() {
  const { id } = useParams();
  const wine = getWineById(id);

  if (!wine) {
    return (
      <div className="container">
        <p>Cuvée introuvable.</p>
        <Link to="/cave" className="btn btn--ghost">Retour à ma cave</Link>
      </div>
    );
  }

  return (
    <div className="detail">
      <div className="detail__photo">
        {wine.photo ? <img src={wine.photo} alt={wine.nom} /> : <span>🍷</span>}
      </div>

      <div className="container">
        {/* Infos prioritaires : nom, producteur, année, cépages */}
        <h1 className="detail__name">{wine.nom}</h1>
        <p className="detail__producer">
          {wine.producteur} · <strong>{wine.millesime}</strong>
        </p>
        <p className="detail__cepages muted">{wine.cepages.join(", ")}</p>

        <div className="detail__price-row">
          <span className="detail__price">{wine.prix.toFixed(2)} €</span>
          <button className="btn btn--ghost">❤️ Wishlist</button>
        </div>

        <div className="detail__specs">
          <Spec label="Région" value={wine.region} />
          <Spec label="Couleur" value={wine.couleur} />
          <Spec label="Degré" value={`${wine.degre} %`} />
          <Spec label="Contenance" value={wine.contenance} />
        </div>

        <h3>Mots-clés</h3>
        <div className="detail__tags">
          {wine.motsCles.map((m) => (
            <span key={m} className="chip chip--active">{m}</span>
          ))}
        </div>

        <button className="btn btn--primary btn--block detail__add">
          Ajouter à ma cave
        </button>
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className="spec">
      <span className="spec__label">{label}</span>
      <span className="spec__value">{value}</span>
    </div>
  );
}
