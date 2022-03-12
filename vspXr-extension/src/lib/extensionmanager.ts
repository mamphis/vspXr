import axios from "axios";
import { Blob } from "buffer";
import { commands, Memento, Uri, workspace } from "vscode";
import { Extension } from "../model/extension";

export class ExtensionManager {
    constructor(private storage: Memento, private temporaryStorageUri: Uri) {
        workspace.fs.createDirectory(temporaryStorageUri);
    }

    async downloadAndInstallExtension(extension: Extension) {
        const url = new URL(`/assets/${extension.id}/latest`, extension.registry).toString();

        const storageUri = Uri.joinPath(this.temporaryStorageUri, `${extension.publisher}.${extension.id}-${extension.version}.vsix`);

        console.log("Downloading to " + storageUri.toString());


        const downloadedExtension = (await axios.get(url, {
            responseType: 'arraybuffer'
        }).catch(e => {
            console.warn("Error downloading extension.")
            console.warn(e);

        }))?.data;// as Buffer;

        if (!downloadedExtension) {
            console.log("extension is not defined")
            return;
        }

        await workspace.fs.writeFile(storageUri, new Uint8Array(downloadedExtension));

        await commands.executeCommand('workbench.extensions.command.installFromVSIX', [storageUri]);

        await workspace.fs.delete(storageUri);
    }
}