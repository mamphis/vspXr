import jszip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import { VSIX } from './vsix.xml';
import { Vsix } from '../../model/vsix';
import { VsixVersion } from '../../model/vsixversion';
import { database } from '../..';
import { join } from 'path';
import { mkdir, rename } from 'fs/promises';

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
            // Try to find a extension with the name and the publisher
            let [newVsix] = await database.vsix.find(select(vsix, 'name', 'publisher'));

            // No extenion found.
            if (!newVsix) {
                // Create new vsix entry in database
                const [{ id: newId }] = await database.vsix.create(vsix);

                const insertedVsix = await database.vsix.get(newId);
                if (!insertedVsix) {
                    throw new Error('Could not create vsix in database.');
                }

                newVsix = insertedVsix;
            }

            return await Promise.all(vsix.versions.map(async vsixVersion => {
                vsixVersion.vsix = newVsix;
                let id;
                if (!vsixVersion.id) {
                    // Try to get the version that was provided.
                    const [version] = await database.vsixVersion.find(select(vsixVersion, 'vsix', 'version'));

                    // Throw an error if the version already exists
                    if (version) {
                        return Promise.reject(new Error(`The version ${version.version} is already present for extension ${vsix.name}`));
                    }

                    // Version does not exist. Store the file and create a version
                    const storagePath = join(process.env.PACKAGE_STORAGE_PATH, newVsix.publisher, newVsix.name);
                    await mkdir(storagePath);
                    await rename(file.path, join(storagePath, vsixVersion.filename));
                    [{ id }] = await database.vsixVersion.create(vsixVersion);
                } else {
                    await database.vsixVersion.update(vsixVersion.id, vsixVersion);
                    id = vsixVersion.id;
                }

                return database.vsixVersion.get(id, { relations: ['vsix'] }) as unknown as VsixVersion;
            }));
        } catch (e) {
            throw e;
        }
    }
}