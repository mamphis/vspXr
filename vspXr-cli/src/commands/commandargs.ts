import { ArgumentsCamelCase } from "yargs";

/**
 * The command arguments used for the upload command
 *
 * @export
 * @interface UploadCommandArgs
 * @extends {ArgumentsCamelCase}
 */
export interface UploadCommandArgs extends ArgumentsCamelCase {
    vsix: string | undefined;
    registry: string | undefined;
}