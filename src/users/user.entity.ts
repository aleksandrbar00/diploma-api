import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  passwordHash: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  refreshToken: string;
}
