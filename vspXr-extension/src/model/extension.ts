/**
 * An interface which describes an extension for the extension manager
 *
 * @export
 * @interface Extension
 */
export interface Extension {
    id: string;
    name: string;
    description: string;
    publisher: string;
    version: string;
    installed: boolean;
    icon: string;
    registry: string;
}

/**
 * An interface which describes the extension on the server
 *
 * @export
 * @interface ServerExtension
 */
export interface ServerExtension {
    id: string;
    publisher: string;
    name: string;
    icon: string;
    versions: ServerExtensionVersion[];
    latestVersion: ServerExtensionVersion;
}

/**
 * An interface which describes a version of the extension
 *
 * @export
 * @interface ServerExtensionVersion
 */
export interface ServerExtensionVersion {
    id: string;
    version: string;
    description: string;
}