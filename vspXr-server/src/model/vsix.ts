import { AfterLoad, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { VsixVersion } from "./vsixversion";

/**
 * The model for vsix files
 *
 * @export
 * @class Vsix
 */
@Entity()
export class Vsix {
    /**
     * The id (name) of the extension
     *
     * @type {string}
     * @memberof Vsix
     */
    @PrimaryColumn()
    id!: string;

    /**
     * The publisher of the extension
     *
     * @type {string}
     * @memberof Vsix
     */
    @Column()
    publisher!: string;

    /**
     * The display name of the extension
     *
     * @type {string}
     * @memberof Vsix
     */
    @Column()
    name!: string;

    /**
     * The path to the icon of the extension
     *
     * @type {string}
     * @memberof Vsix
     */
    @Column()
    icon!: string;

    /**
     * The versions uploaded to the registry
     *
     * @type {VsixVersion[]}
     * @memberof Vsix
     */
    @OneToMany(() => VsixVersion, version => version.vsix, { eager: true })
    versions!: VsixVersion[];

    /**
     * After loading the extension from the database assign this instance to all versions
     *
     * @memberof Vsix
     */
    @AfterLoad()
    onAfterLoad() {
        this.versions.forEach(version => {
            version.vsix = { ...this };
        })
    }
}