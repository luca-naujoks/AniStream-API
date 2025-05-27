import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type', type: 'varchar', length: 255, nullable: false })
  type: string;

  @Column({ name: 'tmdb_id', type: 'int' })
  tmdb_id: number;

  @Column({
    name: 'external_identifier',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  external_identifier: string;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ name: 'poster', type: 'varchar', length: 255, nullable: false })
  poster: string;

  @Column({ name: 'backdrop', type: 'varchar', length: 255, nullable: false })
  backdrop: string;

  @Column({ name: 'online_available', type: 'boolean', default: true })
  online_available: boolean;
}
