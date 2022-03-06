import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { VsixVersion } from "./vsixversion";

@Entity()
export class Vsix {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    publisher!: string;

    @Column()
    name!: string;

    @ManyToOne(() => VsixVersion, version => version.vsix, { eager: true })
    versions!: VsixVersion[];
}