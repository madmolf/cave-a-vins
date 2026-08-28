import { useState } from "react";
import WineCard from "../../components/WineCard";
import ViewToggle from "../../components/ViewToggle";
import { wines } from "../../data/wines";
import "./Wishlist.scss";

export default function Wishlist() {
  const [view, setView] = useState("list"); // grid | list
  // Mock : quelques cuvées en wishlist. À brancher sur les données utilisateur.
  const list = wines.slice(1, 3);

  return (
    <div className="wishlist container">
      <div className="wishlist__head">
        <h1>Ma wishlist</h1>
        {list.length > 0 && <ViewToggle value={view} onChange={setView} />}
      </div>

      {list.length === 0 ? (
        <p className="muted">Votre wishlist est vide pour le moment.</p>
      ) : (
        <div className={`wishlist__grid wishlist__grid--${view}`}>
          {list.map((w) => (
            <WineCard key={w.id} wine={w} view={view} />
          ))}
        </div>
      )}
    </div>
  );
}
