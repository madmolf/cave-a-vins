const language = navigator.language.toLowerCase().startsWith('fr')
  ? 'fr'
  : 'en';

function trad(id: string, fr: string, en: string) {
  const element = document.getElementById(id);

  if (element) {
    element.innerHTML = language === 'fr' ? fr : en;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  trad('trad-title', 'Cave à vin', 'Wine cellar');
  trad(
    'trad-description',
    'Lecture des données du backend NestJS sans framework frontend.',
    'Read data from the NestJS backend without a frontend framework.',
  );
  trad('trad-home', 'API Home', 'API Home');
  trad('trad-wines', 'Vins', 'Wines');
  trad('trad-users', 'Utilisateurs', 'Users');
  trad('trad-add-wine', 'Ajouter le vin', 'Add wine');
  trad('trad-backend-status', 'Statut backend', 'Backend status');
  trad('trad-data', 'Données', 'Data');
});
