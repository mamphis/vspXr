import axios, { AxiosResponse } from "axios";
import FormData from 'form-data';
import { readdir, readFile, stat } from "fs/promises";
import { extname } from "path";
import { compare, SemVer } from "semver";
import { URL } from "url";
import { Argv } from "yargs";
import { loadConfig } from "../utils/configfilehelper";
import { UploadCommandArgs } from "./commandargs";

const uploadCommand = async (args: UploadCommandArgs) => {
    let vsixFile: string | undefined;
    if (args.vsix) {
        try {
            await stat(args.vsix);
        } catch {
            return Promise.reject(`"${args.vsix}" does not exist.`);
        }

        vsixFile = args.vsix;
    }

    if (!vsixFile) {
        const dirents = await readdir(process.cwd());
        const candidates = dirents.filter(dirent => extname(dirent) === '.vsix')
        if (candidates.length === 0) {
            return Promise.reject('The current directory does not contain a vsix file');
        }

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

    const formdata = new FormData();
    formdata.append('vsix', await readFile(vsixFile), { filename: vsixFile });
    const uploadResponse = await axios.post(new URL('/vsix', registry).toString(),
        formdata,
        {
            onUploadProgress: (ev) => {
                console.log(ev);
            },
            headers: {
                ...formdata.getHeaders(),
            },
        }).catch(e => {
            return e.response;
        });

    if (uploadResponse.statusCode === 200) {
        console.log(`Successfully uploaded the extension to "${registryName}":
    Publisher: ${uploadResponse.data.vsix.publisher}
    Name: ${uploadResponse.data.vsix.name}
    Version: ${uploadResponse.data.version}`);
    } else {
        return Promise.reject(`Cannot upload extension to "${registryName}":
    Error: ${uploadResponse.data.message}`);
    }
}

export const uploadCommandBuilder = (args: Argv) => {
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