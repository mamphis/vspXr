import axios from "axios";
import { commands, extensions, Memento, Uri, workspace } from "vscode";
import { Extension, ServerExtension } from "../model/extension";
import { gt } from 'semver';

export class ExtensionManager {
    private installedExtensions: Extension[];
    constructor(private storage: Memento, private temporaryStorageUri: Uri) {
        workspace.fs.createDirectory(temporaryStorageUri);
        this.installedExtensions = storage.get('installedExtensions', [] as Extension[]);

        extensions.onDidChange(() => {
            console.log("BEFORE: ", this.installedExtensions);
            this.installedExtensions = this.installedExtensions.filter(ext => !!extensions.getExtension(`${ext.publisher}.${ext.id}`));
            console.log("AFTER: ", this.installedExtensions);
        });
    }

    async downloadAndInstallExtension(extension: Extension) {
        const installedExtension = this.installedExtensions.find(e => e.id === extension.id && e.publisher === extension.publisher && e.version === extension.version);

        if (installedExtension) {
            console.warn(`extension is allready installed: ${extension.id}: ${extension.name}`);
            return;
        }

        const url = new URL(`/assets/${extension.id}/latest`, extension.registry).toString();

        const storageUri = Uri.joinPath(this.temporaryStorageUri, `${extension.publisher}.${extension.id}-${extension.version}.vsix`);
        const downloadedExtension = (await axios.get(url, {
            responseType: 'arraybuffer'
        }).catch(e => {
            console.warn("Error downloading extension.")
            console.warn(e);

        }))?.data;// as Buffer;

        if (!downloadedExtension) {
            console.warn("extension is not defined")
            return;
        }

        await workspace.fs.writeFile(storageUri, new Uint8Array(downloadedExtension));

        await commands.executeCommand('workbench.extensions.command.installFromVSIX', [storageUri]);

        await workspace.fs.delete(storageUri);

        this.installedExtensions.push(extension);
        this.storage.update('installedExtensions', this.installedExtensions);
    }

    async getExtensionsForUpdate(): Promise<(Extension & { latestVersion: string })[]> {
        return (await Promise.all(this.installedExtensions.map(async extension => {
            const url = new URL(`/vsix/${extension.id}`, extension.registry).toString();
            const serverExtension: ServerExtension = (await axios.get(url)).data;

            if (gt(serverExtension.latestVersion.version, extension.version)) {
                return { ...extension, latestVersion: serverExtension.latestVersion.version };
            }
        }))).filter(e => !!e) as (Extension & { latestVersion: string })[];

        return [];
    }
    processUpdates() {
        this.getExtensionsForUpdate().then(extensions => {
            extensions.forEach(e => {
                this.downloadAndInstallExtension({ ...e, version: e.latestVersion });
                this.installedExtensions = this.installedExtensions.filter(extension => e.id !== extension.id && e.publisher !== extension.publisher && e.version !== extension.version);
            });
        });
    }
}