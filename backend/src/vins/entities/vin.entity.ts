import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'vins' })
export class Vin {
  @PrimaryGeneratedColumn({ name: 'id_vin' })
  id_vin!: number;

  @Column({ type: 'varchar', length: 120 })
  nom!: string;

  @Column({ name: 'id_domaine', type: 'int', nullable: true })
  id_domaine?: number;

  @Column({ name: 'id_region', type: 'int', nullable: true })
  id_region?: number;

  @Column({ type: 'int', nullable: true })
  millesime?: number;

  @Column({
    type: 'enum',
    enum: ['rouge', 'blanc', 'rose', 'effervescent'],
    nullable: true,
  })
  couleur?: 'rouge' | 'blanc' | 'rose' | 'effervescent';

  @Column({ type: 'varchar', length: 120, nullable: true })
  cepage?: string;

  @Column({
    name: 'prix_moyen',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  prix_moyen?: number;
}
