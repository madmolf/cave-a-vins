export class CreateVinDto {
  nom!: string;
  id_domaine?: number;
  id_region?: number;
  millesime?: number;
  couleur?: 'rouge' | 'blanc' | 'rose' | 'effervescent';
  cepage?: string;
  prix_moyen?: number;
}
