import { useState } from "react";
import { wines } from "../../../data/wines";

const existing = [...new Set(wines.flatMap((w) => w.motsCles))];

export default function AddKeyword() {
  const [keywords, setKeywords] = useState(existing);
  const [value, setValue] = useState("");

  const add = (e) => {
    e.preventDefault();
    const k = value.trim().toLowerCase();
    if (k && !keywords.includes(k)) setKeywords([...keywords, k]);
    setValue("");
  };

  return (
    <div className="container">
      <h1>Ajouter un mot-clé</h1>
      <p className="muted">Les mots-clés servent à filtrer les cuvées (goût, style…).</p>

      <form className="stack" onSubmit={add}>
        <label className="field">
          <span>Nouveau mot-clé</span>
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="ex. tannique" />
        </label>
        <button type="submit" className="btn btn--primary btn--block">Ajouter</button>
      </form>

      <h3 style={{ marginTop: "24px" }}>Mots-clés existants</h3>
      <div className="chips">
        {keywords.map((k) => (
          <span key={k} className="chip">{k}</span>
        ))}
      </div>
    </div>
  );
}
