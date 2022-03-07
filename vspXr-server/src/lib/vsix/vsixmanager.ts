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
        vsix.name = vsixData.PackageManifest.Metadata.Identity.Id;

        const vsixVersion = new VsixVersion();
        vsixVersion.version = vsixData.PackageManifest.Metadata.Identity.Version;
        vsix.versions = [vsixVersion];

        return vsix;
    }

    async store(file: Express.Multer.File, vsixDefinition: Vsix): Promise<VsixVersion> {
        try {
            // Try to find a extension with the name and the publisher
            let [newVsix] = await database.vsix.find({ ...select(vsixDefinition, 'name', 'publisher'), relations: ['versions'] });

            // No extenion found.
            if (!newVsix) {
                // Create new vsix entry in database
                const [{ id: newId }] = await database.vsix.create(vsixDefinition);

                const insertedVsix = await database.vsix.get(newId);
                if (!insertedVsix) {
                    throw new Error('Could not create vsix in database.');
                }

                newVsix = insertedVsix;
            }

            // Test if a version is present.
            const versionNo = vsixDefinition.versions[0].version;
            const [version] = await database.vsixVersion.find({
                where: {
                    vsix: {
                        id: newVsix.id
                    },
                    version: versionNo
                },
                relations: ['vsix'],
            });

            if (version) {
                return Promise.reject(`The version ${versionNo} is already present for extension ${vsixDefinition.name}`);
            }

            const [{ id: newVersionId }] = await database.vsixVersion.create({
                vsix: newVsix,
                version: versionNo
            });

            const newVersion = await database.vsixVersion.get(newVersionId, { relations: ['vsix'] });
            if (!newVersion) {
                return Promise.reject(`The version ${versionNo} of the extension ${vsixDefinition.name} cannot be stored.`)
            }

            return newVersion;
        } catch (e) {
            throw e;
        } finally {
            this.logger.debug('Unlinking file: ' + file.path);
            unlink(file.path);
        }
    }
}