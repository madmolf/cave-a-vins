import { NavLink, Outlet } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Avatar from "../Avatar";
import Logo from "../Logo";
import "./Layout.scss";

export default function Layout() {
  const { isLoggedIn, user } = useApp();

  // Nom affiché à côté de l'avatar (tablette+) : 1er segment de l'email, capitalisé.
  const displayName = user?.email
    ? user.email.split("@")[0].split(/[._-]/)[0].replace(/^\w/, (c) => c.toUpperCase())
    : "";

  return (
    <div className="app">
      {/* --- Header --- */}
      <header className="header">
        <div className="header__left">
          <NavLink to="/cave" className="header__navlink">Les caves</NavLink>
        </div>

        {/* Logo centré — à remplacer par le logo de Lukas */}
        <NavLink to="/" className="header__logo" aria-label="Rich Cellar — accueil">
          <Logo size={30} />
          <span className="header__logo-text">Rich Cellar</span>
        </NavLink>

        <div className="header__right">
          {isLoggedIn ? (
            <NavLink to="/account" className="header__avatar" aria-label="Mon compte">
              <Avatar photo={user?.photo} name={user?.email} size={34} />
              <span className="header__user-name">{displayName || "Mon compte"}</span>
            </NavLink>
          ) : (
            <NavLink to="/login" className="header__navlink">Connexion</NavLink>
          )}
        </div>
      </header>

      {/* --- Contenu --- */}
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  );
}
