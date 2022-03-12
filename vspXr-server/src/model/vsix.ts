import { AfterLoad, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { VsixVersion } from "./vsixversion";

@Entity()
export class Vsix {
    @PrimaryColumn()
    id!: string;

    @Column()
    publisher!: string;

    @Column()
    name!: string;

    @Column()
    icon!: string;

    @OneToMany(() => VsixVersion, version => version.vsix, { eager: true })
    versions!: VsixVersion[];

    @AfterLoad()
    onAfterLoad() {
        this.versions.forEach(version => {
            version.vsix = { ...this };
        })
    }
}