import { ArgumentsCamelCase } from "yargs";

interface CommandArgs extends ArgumentsCamelCase {
    _: (string | number)[],
    '$0': string;
}

export interface UploadCommandArgs extends CommandArgs {
    vsix: string | undefined;
    registry: string | undefined;
}