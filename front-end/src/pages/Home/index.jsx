import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import useMediaQuery from "../../hooks/useMediaQuery";
import heroImg from "../../assets/cave_haut-de-page.jpeg";
import gesteImg from "../../assets/verre-de-vin.jpg";
import memoireImg from "../../assets/expo-bouteilles.jpeg";
import "./Home.scss";

// Icône « scanner » : viseur (coins) + barres de code-barres au centre.
const ScanIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="scan-icon"
  >
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <path d="M9 8v8" />
    <path d="M12 8v8" />
    <path d="M15 8v8" />
  </svg>
);

/**
 * Accueil — maquette Rich Cellar. La copie et le footer s'adaptent au format
 * (mobile 390 / tablette 834) via useMediaQuery, la mise en page via Home.scss.
 */
export default function Home() {
  const isWide = useMediaQuery("(min-width: 834px)"); // tablette+
  const isDesktop = useMediaQuery("(min-width: 1440px)"); // desktop

  return (
    <div className="home">
      {/* --- Hero --- */}
      <header className="home-hero">
        <div
          className="home-hero__media"
          style={{ backgroundImage: `url(${heroImg})` }}
          aria-hidden="true"
        />
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Carnet de dégustation</p>
          <h1 className="home-hero__title">
            Chaque bouteille goûtée<br />
            trouve sa place{isWide ? " en cave" : ""}.
          </h1>
          <p className="home-hero__lead">
            {isDesktop
              ? "Scannez le code-barres, la fiche se remplit : appellation, cépages, millésime. Vous n'écrivez que ce qui compte — la robe, le nez, la finale."
              : isWide
                ? "Scannez le code-barres, la fiche se remplit : appellation, cépages, millésime. Vous n'écrivez que ce qui compte."
                : "Scannez le code-barres : appellation, cépages et millésime se remplissent seuls."}
          </p>
          <Link to="/scan" className="btn btn--light btn--block home-hero__scan">
            <ScanIcon /> Scanner une bouteille
          </Link>
          <Link to="/cave" className="home-hero__link">Parcourir les caves</Link>
        </div>
      </header>

      {/* --- 01 — Le geste (crème) --- */}
      <section className="home-section home-section--cream">
        <div className="home-section__body">
          <span className="home-section__label">01 — Le geste</span>
          <h2 className="home-section__title">
            {isWide ? "Du code-barres à la fiche de dégustation" : "Du code-barres à la fiche"}
          </h2>
          <p className="home-section__lead">
            {isDesktop
              ? "Un cadrage sur l'étiquette suffit. Domaine, appellation, assemblage et millésime sont reconnus, puis versés dans votre cave. Le reste vous appartient : note sur cinq, température de service, accord retenu."
              : isWide
                ? "Domaine, appellation, assemblage et millésime sont reconnus puis versés dans votre cave. Le reste vous appartient : note sur cinq, température de service, accord retenu."
                : "Domaine, appellation et assemblage reconnus, versés dans votre cave. Vous n'ajoutez que la note et l'accord."}
          </p>
          {/* Desktop : liste à puces */}
          {isDesktop && (
            <ul className="home-list">
              <li>Fiche pré-remplie en moins de deux secondes</li>
              <li>Vocabulaire de dégustation guidé, jamais imposé</li>
              <li>Bouteille inconnue ? Vous complétez, elle enrichit la base</li>
            </ul>
          )}
          {/* Tablette+ : le lien fait partie de la colonne texte */}
          {isWide && (
            <Link to="/wine/1" className="home-link">Voir une fiche complète →</Link>
          )}
        </div>
        <div className="home-media">
          <img
            className="home-media__img"
            src={gesteImg}
            alt="Service d'un vin rouge dans un verre de dégustation"
          />
          {/* Desktop : carte fiche posée sur l'image */}
          {isDesktop && (
            <div className="home-fiche">
              <span className="home-fiche__badge">Ajouté à la cave</span>
              <strong className="home-fiche__name">Saint-Émilion 2018</strong>
              <span className="home-fiche__meta">Merlot 80 % · Cabernet franc 20 %</span>
            </div>
          )}
        </div>
        {/* Mobile : le lien passe sous l'image */}
        {!isWide && (
          <Link to="/wine/1" className="home-link">Voir une fiche complète →</Link>
        )}
      </section>

      {/* --- 02 — La mémoire (bordeaux) --- */}
      <section className="home-section home-section--bordeaux">
        <div className="home-media">
          <img
            className="home-media__img"
            src={memoireImg}
            alt="Casier de bouteilles rangées en cave"
          />
        </div>
        <div className="home-section__body">
          <span className="home-section__label">02 — La mémoire</span>
          <h2 className="home-section__title">Votre cave se souvient mieux que vous</h2>
          <p className="home-section__lead">
            {isDesktop
              ? "Filtrez par cépage, région ou millésime. Retrouvez le vin d'un dîner de novembre, comparez deux verticales du même domaine, et gardez trace des bouteilles bues comme de celles à ouvrir."
              : "Filtrez par cépage, région ou millésime. Bouteilles bues et bouteilles à ouvrir, au même endroit."}
          </p>
          <div className="home-stats">
            <div className="home-stat">
              <span className="home-stat__num">312</span>
              <span className="home-stat__label">bouteilles suivies</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__num">47</span>
              <span className="home-stat__label">appellations</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__num">9</span>
              <span className="home-stat__label">ans de notes</span>
            </div>
          </div>
          <Link to="/login" className="btn btn--light btn--block">Créer ma cave</Link>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="home-footer">
        {isWide ? (
          <>
            <div className="home-footer__brand">
              <div className="home-footer__brand-head">
                <Logo size={24} /> <strong>Rich Cellar</strong>
              </div>
              <p className="home-footer__tagline muted">
                La bibliothèque des vins que vous avez réellement goûtés.
              </p>
            </div>
            <div className="home-footer__col">
              <h4>Explorer</h4>
              <Link to="/cave">Les caves</Link>
              <a href="#">Cépages</a>
              <a href="#">Millésimes</a>
            </div>
            <div className="home-footer__col">
              <h4>Compte</h4>
              <Link to="/login">Connexion</Link>
              <Link to="/login">Créer un compte</Link>
              <Link to="/cave">Ma cave</Link>
            </div>
            {isDesktop && (
              <div className="home-footer__col">
                <h4>Maison</h4>
                <a href="#">À propos</a>
                <a href="#">Mentions légales</a>
                <a href="#">Contact</a>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="home-footer__brand">
              <Logo size={24} className="home-footer__logo" />
              <strong>Rich Cellar</strong>
            </div>
            <nav className="home-footer__links">
              <Link to="/cave">Les caves</Link>
              <a href="#">Cépages</a>
              <Link to="/cave">Ma cave</Link>
              <Link to="/login">Connexion</Link>
              <a href="#">À propos</a>
              <a href="#">Contact</a>
            </nav>
          </>
        )}
        <p className="home-footer__legal">
          © 2026 Rich Cellar · L'abus d'alcool est dangereux pour la santé. À
          consommer avec modération.
        </p>
      </footer>
    </div>
  );
}
