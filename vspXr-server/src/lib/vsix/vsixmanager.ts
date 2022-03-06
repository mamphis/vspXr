import jszip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import { VSIX } from './vsix.xml';
import { Vsix } from '../../model/vsix';
import { VsixVersion } from '../../model/vsixversion';
import { database } from '../..';

function select<T, K extends keyof T>(value: T, ...keys: K[]): Partial<T> {
    return keys.reduce((partial, key) => {
        partial[key] = value[key];
        return partial;
    }, {} as Partial<T>);
}


export class VsixManager {

    private static instance: VsixManager;

    static get the() {
        if (!this.instance) {
            this.instance = new VsixManager();
        }

        return this.instance;
    }

    private constructor() { }

    async parseVsixData(vsixBuffer: Buffer): Promise<Vsix> {
        const data = await jszip.loadAsync(vsixBuffer);
        const xml = await data.files['extension.vsixmanifest'].async('string');
        const parser = new XMLParser({
            ignoreAttributes: false,
            parseAttributeValue: true,
            attributeNamePrefix: '',
        });

        const vsixData = parser.parse(xml) as VSIX;
        const vsix = new Vsix();

        vsix.publisher = vsixData.PackageManifest.Metadata.Identity.Publisher;
        vsix.name = vsixData.PackageManifest.Metadata.Identity.Id;

        const vsixVersion = new VsixVersion();
        vsixVersion.version = vsixData.PackageManifest.Metadata.Identity.Version;
        vsix.versions = [vsixVersion];

        return vsix;
    }

    async store(file: Express.Multer.File, vsix: Vsix): Promise<VsixVersion[]> {
        try {
            let [newVsix] = await database.vsix.find(select(vsix, 'name', 'publisher'));
            if (!newVsix) {
                const [{ id: newId }] = await database.vsix.create(vsix);

                const insertedVsix = await database.vsix.get(newId);

                if (!insertedVsix) {
                    throw new Error('Could not create vsix in database.');
                }

                newVsix = insertedVsix;
            }

            return await Promise.all(vsix.versions.map(async v => {
                v.vsix = newVsix;
                let id;
                if (!v.id) {
                    const [version] = await database.vsixVersion.find(select(v, 'vsix', 'version'));

                    if (version) {
                        return Promise.reject(new Error(`The version ${version.version} is already present for extension ${vsix.name}`));
                    }

                    // TODO: Save the file
                    [{ id }] = await database.vsixVersion.create(v);
                } else {
                    await database.vsixVersion.update(v.id, v);
                    id = v.id;
                }

                return database.vsixVersion.get(id, { relations: ['vsix'] }) as unknown as VsixVersion;
            }));
        } catch (e) {
            throw e;
        }
    }
}