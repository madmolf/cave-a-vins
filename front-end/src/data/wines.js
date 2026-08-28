// Données de démonstration (mock) — remplacer par l'API back-end plus tard.
// Structure alignée sur les infos de fiche cuvée du cahier des charges :
// nom, producteur, année/millésime, cépages, région, couleur, degré, prix, photo.

export const wines = [
  {
    id: "1",
    nom: "Château des Ormes",
    producteur: "Domaine Lefèvre",
    millesime: 2019,
    cepages: ["Merlot", "Cabernet Sauvignon"],
    region: "Bordeaux",
    couleur: "rouge",
    degre: 13.5,
    contenance: "75 cl",
    prix: 18.9,
    photo: "",
    motsCles: ["fruité", "boisé", "corsé"],
    dateAjout: "2026-06-12",
    codeBarre: "3760040000019",
  },
  {
    id: "2",
    nom: "Clos de la Roche",
    producteur: "Maison Aubert",
    millesime: 2021,
    cepages: ["Pinot Noir"],
    region: "Bourgogne",
    couleur: "rouge",
    degre: 13,
    contenance: "75 cl",
    prix: 34.0,
    photo: "",
    motsCles: ["élégant", "épicé"],
    dateAjout: "2026-07-01",
    codeBarre: "3760040000026",
  },
  {
    id: "3",
    nom: "Les Terrasses Blanches",
    producteur: "Domaine du Val",
    millesime: 2022,
    cepages: ["Chardonnay"],
    region: "Bourgogne",
    couleur: "blanc",
    degre: 12.5,
    contenance: "75 cl",
    prix: 22.5,
    photo: "",
    motsCles: ["minéral", "frais", "agrumes"],
    dateAjout: "2026-05-20",
    codeBarre: "3760040000033",
  },
  {
    id: "4",
    nom: "Rosé d'Été",
    producteur: "Cave de Provence",
    millesime: 2023,
    cepages: ["Grenache", "Cinsault"],
    region: "Provence",
    couleur: "rosé",
    degre: 12,
    contenance: "75 cl",
    prix: 11.9,
    photo: "",
    motsCles: ["léger", "fruité", "estival"],
    dateAjout: "2026-06-28",
    codeBarre: "3760040000040",
  },
];

export const regions = ["Bordeaux", "Bourgogne", "Provence", "Rhône", "Loire", "Alsace"];
export const couleurs = ["rouge", "blanc", "rosé", "pétillant"];

export function getWineById(id) {
  return wines.find((w) => w.id === id);
}

export function getWineByBarcode(code) {
  return wines.find((w) => w.codeBarre === code);
}
