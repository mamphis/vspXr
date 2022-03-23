declare namespace NodeJS {
    export interface ProcessEnv {
        TEMP_UPLOAD_PATH: string;
        PACKAGE_STORAGE_PATH: string;
        ASSET_PATH: string;
        SQLITE_DATABASE: string;
        SQLJS_DATABASE: string;
        SERVER_PORT: number;
        REGISTRY_NAME: string;
        BROADCAST_PORT: number;
    }
}