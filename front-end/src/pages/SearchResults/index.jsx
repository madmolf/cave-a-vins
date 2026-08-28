import { useMemo, useState } from "react";
import WineCard from "../../components/WineCard";
import ViewToggle from "../../components/ViewToggle";
import { wines, regions, couleurs } from "../../data/wines";
import "./SearchResults.scss";

const allKeywords = [...new Set(wines.flatMap((w) => w.motsCles))];

export default function SearchResults() {
  const [query, setQuery] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [region, setRegion] = useState("");
  const [couleur, setCouleur] = useState("");

  const [view, setView] = useState("list"); // grid | list

  const toggleKw = (k) =>
    setKeywords((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  const hasFilters = query || keywords.length || region || couleur;

  const results = useMemo(() => {
    return wines.filter((w) => {
      const q = query.trim().toLowerCase();
      const matchText =
        !q ||
        w.nom.toLowerCase().includes(q) ||
        w.producteur.toLowerCase().includes(q) ||
        w.cepages.some((c) => c.toLowerCase().includes(q));
      const matchKw = keywords.every((k) => w.motsCles.includes(k));
      const matchRegion = !region || w.region === region;
      const matchCouleur = !couleur || w.couleur === couleur;
      return matchText && matchKw && matchRegion && matchCouleur;
    });
  }, [query, keywords, region, couleur]);

  const reset = () => {
    setQuery("");
    setKeywords([]);
    setRegion("");
    setCouleur("");
  };

  return (
    <div className="search">
      <div className="search__header container">
        <h1>Rechercher un vin</h1>

        <div className="search__bar">
          <span className="search__icon">🔎</span>
          <input
            type="search"
            placeholder="Nom, producteur, cépage…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Recherche"
          />
          {query && (
            <button className="search__clear" onClick={() => setQuery("")} aria-label="Effacer">
              ✕
            </button>
          )}
        </div>

        <div className="search__selects">
          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Région">
            <option value="">Toutes régions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select value={couleur} onChange={(e) => setCouleur(e.target.value)} aria-label="Couleur">
            <option value="">Toutes couleurs</option>
            {couleurs.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <p className="search__kw-label">Filtrer par mots-clés</p>
        <div className="chips">
          {allKeywords.map((k) => (
            <button
              key={k}
              className={`chip ${keywords.includes(k) ? "chip--active" : ""}`}
              onClick={() => toggleKw(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="search__results container">
        <div className="search__results-head">
          <span className="muted">{results.length} résultat(s)</span>
          <div className="search__results-actions">
            <ViewToggle value={view} onChange={setView} />
            {hasFilters && (
              <button className="search__reset" onClick={reset}>
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="search__empty">
            <span className="search__empty-icon">🍇</span>
            <p className="muted">Aucun vin ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className={`search__list search__list--${view}`}>
            {results.map((w) => (
              <WineCard key={w.id} wine={w} view={view} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
