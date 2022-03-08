import jszip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import { VSIX } from './vsix.xml';
import { Vsix } from '../../model/vsix';
import { VsixVersion } from '../../model/vsixversion';
import { database } from '../..';
import { join } from 'path';
import { mkdir, rename, unlink } from 'fs/promises';
import { LogManager } from '../logger';
import { Logger } from '../logger';

function select<T, K extends keyof T>(value: T, ...keys: K[]): Partial<T> {
    return keys.reduce((partial, key) => {
        partial[key] = value[key];
        return partial;
    }, {} as Partial<T>);
}


export class VsixManager {

    private static instance: VsixManager;
    private logger: Logger;

    static get the() {
        if (!this.instance) {
            this.instance = new VsixManager();
        }

        return this.instance;
    }

    private constructor() {
        this.logger = LogManager.getLogger('VsixManager');
    }

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
        vsix.id = vsixData.PackageManifest.Metadata.Identity.Id;
        vsix.name = vsixData.PackageManifest.Metadata.DisplayName;

        const vsixVersion = new VsixVersion();
        vsixVersion.version = vsixData.PackageManifest.Metadata.Identity.Version;
        vsixVersion.description = vsixData.PackageManifest.Metadata.Description['#text'];
        vsix.versions = [vsixVersion];



        return vsix;
    }

    async store(file: Express.Multer.File, vsixDefinition: Vsix): Promise<VsixVersion> {
        try {
            // Try to find a extension with the name and the publisher
            let newVsix = await database.vsix.get(vsixDefinition.id, { relations: ['versions'] });

            // No extenion found.
            if (!newVsix) {
                // Create new vsix entry in database
                const [{ id: newId }] = await database.vsix.create(vsixDefinition);

                const insertedVsix = await database.vsix.get(newId);
                if (!insertedVsix) {
                    throw new Error('Could not create vsix in database.');
                }

                newVsix = insertedVsix;
            } else {
                await database.vsix.update(vsixDefinition.id, { ...select(vsixDefinition, 'name', 'publisher') })
            }

            // Test if a version is present.
            const newVersionDefinition = vsixDefinition.versions[0];
            const [version] = await database.vsixVersion.find({
                where: {
                    vsix: {
                        id: newVsix.id
                    },
                    version: newVersionDefinition.version
                },
                relations: ['vsix'],
            });

            if (version) {
                return Promise.reject(`The version ${newVersionDefinition.version} is already present for extension ${vsixDefinition.name}`);
            }

            const [{ id: newVersionId }] = await database.vsixVersion.create({
                vsix: newVsix,
                version: newVersionDefinition.version,
                description: newVersionDefinition.description
            });

            const newVersion = await database.vsixVersion.get(newVersionId, { relations: ['vsix'] });

            if (!newVersion) {
                return Promise.reject(`The version ${newVersionDefinition.version} of the extension ${vsixDefinition.name} cannot be stored.`)
            }

            const storagePath = join(process.env.PACKAGE_STORAGE_PATH, newVsix.publisher, newVsix.id);
            await mkdir(storagePath, { recursive: true });
            await rename(file.path, join(storagePath, newVersion.filename));

            return newVersion;
        } catch (e) {
            throw e;
        }
    }
}