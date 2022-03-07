export type Identity = {
    Language: string;
    Id: string;
    Version: string;
    Publisher: string;
};

export type XmlText = {
    '#text': string;
};

export type Property = {
    Id: string;
    Value: string | boolean;
};

export type Properties = {
    Property: Property[];
};

export type Metadata = {
    Identity: Identity,
    DisplayName: string;
    Description: XmlText;
    Tags: string;
    Categories: string;
    GalleryFlags: string;
    Properties: Properties;
};

export type Installation = {
    InstallationTarget: {
        Id: string;
    }
};

export type Asset = {
    Type: string;
    Path: string;
    Addressable: boolean;
};

export type Assets = {
    Asset: Asset[];
};

export type PackageManifest = {
    Metadata: Metadata;
    Installation: Installation;
    Dependencies: string;
    Assets: Assets;
    Version: string;
};

export type VSIX = {
    PackageManifest: PackageManifest;
};