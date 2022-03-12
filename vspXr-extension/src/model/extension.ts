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

export interface ServerExtension {
    id: string;
    publisher: string;
    name: string;
    icon: string;
    versions: ServerExtensionVersion[];
    latestVersion: ServerExtensionVersion;
}

export interface ServerExtensionVersion {
    id: string;
    version: string;
    description: string;
}