import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Vsix } from "./vsix";

@Entity()
export class VsixVersion {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Vsix, vsix => vsix.versions)
    vsix!: Vsix;

    @Column()
    version!: string;

    get filename() {
        return `${this.vsix.publisher}.${this.vsix.name}-${this.version}.vsix`;
    }
}