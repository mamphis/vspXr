import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { VsixVersion } from "./vsixversion";

@Entity()
export class Vsix {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    publisher!: string;

    @Column()
    name!: string;

    @OneToMany(() => VsixVersion, version => version.vsix, { eager: true })
    versions!: VsixVersion[];
}