import { Exclude, Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ unique: true })
  @Expose()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  @Expose()
  name: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @Exclude()
  balance: number;
}