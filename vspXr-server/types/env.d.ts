declare namespace NodeJS {
    export interface ProcessEnv {
        TEMP_UPLOAD_PATH: string;
        PACKAGE_STORAGE_PATH: string;
        SQLITE_DATABASE: string;
        SERVER_PORT: number;
    }
}