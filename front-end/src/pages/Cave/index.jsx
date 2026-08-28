import { useMemo, useState } from "react";
import WineCard from "../../components/WineCard";
import ViewToggle from "../../components/ViewToggle";
import { wines, regions, couleurs } from "../../data/wines";
import "./Cave.scss";

export default function Cave() {
  const [view, setView] = useState("grid"); // grid | list
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [region, setRegion] = useState("");
  const [couleur, setCouleur] = useState("");
  const [sort, setSort] = useState("recent"); // recent | prix | millesime

  const filtered = useMemo(() => {
    let list = wines.filter(
      (w) =>
        (!region || w.region === region) && (!couleur || w.couleur === couleur)
    );
    list = [...list].sort((a, b) => {
      if (sort === "prix") return a.prix - b.prix;
      if (sort === "millesime") return b.millesime - a.millesime;
      return new Date(b.dateAjout) - new Date(a.dateAjout); // récent
    });
    return list;
  }, [region, couleur, sort]);

  const resetFilters = () => {
    setRegion("");
    setCouleur("");
    setSort("recent");
  };

  return (
    <div className="cave">
      <div className="cave__topbar container">
        <div>
          <h1>Ma cave</h1>
          <p className="muted">{filtered.length} cuvée(s)</p>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </div>

      <button
        className="cave__filter-btn"
        onClick={() => setFiltersOpen((o) => !o)}
        aria-expanded={filtersOpen}
      >
        ⚙︎ Filtrer & trier
      </button>

      <div className="cave__layout">
        {/* Barre latérale de filtres (cf. cahier des charges) */}
        <aside className={`cave__filters ${filtersOpen ? "cave__filters--open" : ""}`}>
          <div className="filter-group">
            <label className="filter-group__label">Trier par</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recent">Ajout récent</option>
              <option value="prix">Prix croissant</option>
              <option value="millesime">Millésime récent</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-group__label">Région</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">Toutes</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-group__label">Couleur</label>
            <div className="chips">
              {couleurs.map((c) => (
                <button
                  key={c}
                  className={`chip ${couleur === c ? "chip--active" : ""}`}
                  onClick={() => setCouleur(couleur === c ? "" : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn--ghost btn--block" onClick={resetFilters}>
            Réinitialiser
          </button>
        </aside>

        {/* Liste des cuvées */}
        <section className={`cave__grid cave__grid--${view}`}>
          {filtered.length === 0 ? (
            <p className="muted container">Aucune cuvée ne correspond à ces filtres.</p>
          ) : (
            filtered.map((w) => <WineCard key={w.id} wine={w} view={view} />)
          )}
        </section>
      </div>
    </div>
  );
}
