import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Avatar from "../../components/Avatar";
import "./Account.scss";

export default function Account() {
  const { isLoggedIn, user, logout, updateAvatar } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  if (!isLoggedIn) {
    return (
      <div className="container">
        <h1>Mon compte</h1>
        <p className="muted">Connectez-vous pour accéder à votre compte.</p>
        <Link to="/login" className="btn btn--primary">Se connecter</Link>
      </div>
    );
  }

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateAvatar(reader.result); // dataURL (mock local)
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="account container stack">
      <h1>Mon compte</h1>

      <div className="account__profile card">
        <Avatar photo={user.photo} name={user.email} size={72} />
        <div className="account__info">
          <p className="muted">Connecté en tant que</p>
          <strong>{user.email}</strong>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
      <button className="btn btn--ghost btn--block" onClick={() => fileRef.current?.click()}>
        {user.photo ? "Changer la photo" : "Ajouter une photo de profil"}
      </button>
      {user.photo && (
        <button className="account__remove" onClick={() => updateAvatar(null)}>
          Retirer la photo
        </button>
      )}
      <p className="account__note muted">
        Photo conservée localement pour la démo (sera enregistrée sur le compte via le serveur).
      </p>

      <Link to="/wishlist" className="btn btn--ghost btn--block">Ma wishlist</Link>
      <Link to="/cave" className="btn btn--ghost btn--block">Ma cave</Link>

      <button
        className="btn btn--primary btn--block"
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
}
