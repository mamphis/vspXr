import axios, { AxiosResponse } from "axios";
import FormData from 'form-data';
import { readdir, readFile, stat } from "fs/promises";
import { basename, extname } from "path";
import { compare, SemVer } from "semver";
import { URL } from "url";
import { Argv, CommandBuilder } from "yargs";
import { loadConfig } from "../utils/configfilehelper";
import { UploadCommandArgs } from "./commandargs";

/**
 * The handler for uploading an extension.
 *
 * @param {UploadCommandArgs} args The arguments provided by the yargs-parser
 */
const uploadCommand = async (args: UploadCommandArgs): Promise<void> => {
    let vsixFile: string | undefined;
    if (args.vsix) {
        try {
            // When a vsix-file is provided check if it exists
            await stat(args.vsix);
        } catch {
            return Promise.reject(`"${args.vsix}" does not exist.`);
        }

        vsixFile = args.vsix;
    }

    if (!vsixFile) {
        // If no vsixFile was found check the current directory if at least one vsix file
        //    is present.
        const dirents = await readdir(process.cwd());
        const candidates = dirents.filter(dirent => extname(dirent) === '.vsix')
        if (candidates.length === 0) {
            return Promise.reject('The current directory does not contain a vsix file');
        }

        // Sort the candidates by the version number and select the latest version.
        vsixFile = candidates.map(candidate => {
            const [_, versionPart] = /.*(\d+\.\d+\.\d+)\.vsix$/.exec(candidate) ?? ['', ''];
            return {
                filename: candidate,
                version: new SemVer(versionPart),
            };
        }).sort((c1, c2) => compare(c2.version, c1.version))[0].filename;
    }

    if (!vsixFile) {
        return Promise.reject(`No vsix file could be determined.`);
    }

    // get config file
    const config = await loadConfig();
    const registry = args.registry ?? config.registry;
    // check connection to registry
    const response: AxiosResponse | undefined = await axios.get(new URL('/info', registry).toString()).catch(err => {
        return err.response;
    });

    if (!response) {
        return Promise.reject(`Cannot connect to registry.`);
    }

    const { name: registryName } = response.data;

    // Load the vsix file and send the file to the registy
    const formdata = new FormData();
    const vsixContent = await readFile(vsixFile);
    formdata.append('vsix', vsixContent, { filename: basename(vsixFile) });
    const uploadResponse: AxiosResponse = await axios.post(new URL('/vsix', registry).toString(),
        formdata,
        {
            onUploadProgress: (ev) => {
                console.log(ev);
            },
            maxBodyLength: vsixContent.length * 2,
            headers: {
                ...formdata.getHeaders(),
            },
        }).catch(e => {
            return e.response ?? { status: 0, data: { message: e.message } };
        });

    if (uploadResponse.status === 200) {
        // The upload was successful
        console.log(`Successfully uploaded the extension to "${registryName}":
    Publisher: ${uploadResponse.data.vsix.publisher}
    Name: ${uploadResponse.data.vsix.name}
    Version: ${uploadResponse.data.version}`);
    } else {
        return Promise.reject(`Cannot upload extension to "${registryName}":
    Error (${uploadResponse.status}): ${uploadResponse.data.message}`);
    }
}

/**
 * The Command Builder for the upload command. Specifies arguments and options for
 * available for the upload command
 *
 * @param {Argv} args The argument parser provided by yargs
 * @return {Argv} The argument parser with the arguments
 */
export const uploadCommandBuilder = (args: Argv): Argv<UploadCommandArgs> => {
    return args
        .positional('vsix', {
            description: 'The file to upload',
            type: 'string',
            demandOption: false,
            positinal: true,
        })
        .option('registry', {
            alias: 'r',
            type: 'string',
        });
}
export default uploadCommand;