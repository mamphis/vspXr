import axios from "axios";
import { gt } from 'semver';
import { commands, extensions, Memento, Uri, workspace } from "vscode";
import { Extension, ServerExtension } from "../model/extension";

/**
 * A helper class for the extensions. 
 *
 * @export
 * @class ExtensionManager
 */
export class ExtensionManager {
    /**
     *  Currently installed extensions which were installed by the vspXr.
     *
     * @private
     * @type {Extension[]}
     * @memberof ExtensionManager
     */
    private installedExtensions: Extension[];

    /**
     * Creates an instance of ExtensionManager.
     * @param {Memento} storage The globalStorage to save the currently installed extensions
     * @param {Uri} temporaryStorageUri The temporaryStorage path to download vsix before installing them
     * @memberof ExtensionManager
     */
    constructor(private storage: Memento, private temporaryStorageUri: Uri) {
        workspace.fs.createDirectory(temporaryStorageUri);
        // Load the extensions from the storage
        this.installedExtensions = storage.get('installedExtensions', [] as Extension[]);

        // If extensions change (install / uninstall) filter the extensions to only include installed
        extensions.onDidChange(() => {
            this.installedExtensions = this.installedExtensions.filter(ext => !!extensions.getExtension(`${ext.publisher}.${ext.id}`));
        });
    }

    /**
     * Download and installes an extension from the registry
     *
     * @param {Extension} extension The extension to download and install
     * @memberof ExtensionManager
     */
    async downloadAndInstallExtension(extension: Extension) {
        // Check if the extension in the current version is already installed
        const installedExtension = this.installedExtensions.find(e => e.id === extension.id && e.publisher === extension.publisher && e.version === extension.version);

        if (installedExtension) {
            console.warn(`extension is allready installed: ${extension.id}: ${extension.name}`);
            return;
        }

        const url = new URL(`/assets/${extension.id}/latest`, extension.registry).toString();
        // Download the vsix file
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
        // Save the extension to disk
        await workspace.fs.writeFile(storageUri, new Uint8Array(downloadedExtension));

        // Install the extension from the disk
        await commands.executeCommand('workbench.extensions.command.installFromVSIX', [storageUri]);

        // Delete the downloaded extension
        await workspace.fs.delete(storageUri);

        this.installedExtensions.push(extension);
        this.storage.update('installedExtensions', this.installedExtensions);
    }

    /**
     * Check each installed extension for updates. If an update is available 
     *  return the extension
     *
     * @return {*}  {(Promise<(Extension & { latestVersion: string })[]>)} The
     *                   extensions which have an update available
     * @memberof ExtensionManager
     */
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

    /**
     * Process updates in background. First the method will get all updateabl
     *  extensions then it will download and install them.
     *
     * @memberof ExtensionManager
     */
    processUpdates() {
        this.getExtensionsForUpdate().then(extensions => {
            Promise.all(extensions.map(async e => {
                await this.downloadAndInstallExtension({ ...e, version: e.latestVersion });
                // Clean the installed extensions by removing the previously installed version
                this.installedExtensions = this.installedExtensions.filter(extension => e.id !== extension.id && e.publisher !== extension.publisher && e.version !== extension.version);
            }));
        }).then(() => {
            // Save the installed extensions
            this.storage.update('installedExtensions', this.installedExtensions);
        });
    }
}