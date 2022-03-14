import { join } from "path";
import { homedir } from "os";
import { readFile, stat, writeFile } from "fs/promises";


/**
 * Interface which defines the safed configuration
 *
 * @interface Config
 */
interface Config {
    registry: string;
}

/** @type {Config} The default configuration which will be used when no c
 * onfiguration file is found. */
const defaultConfig: Config = {
    registry: 'http://localhost:3000',
};


/**
 * Loads the configuration form the nomedirecotry of the user. If no configuration
 * is found the default configuration is saved to disk and then returned
 *
 * @return {Config} The currently saved configuration
 */
const loadConfig: () => Promise<Config> = async () => {
    const home = homedir();
    const configFile = join(home, '.vspxr');

    try {
        // Check if file exists
        await stat(configFile);
    } catch {
        // If it doesn't exist, write the default config
        await writeFile(configFile, JSON.stringify(defaultConfig));
    }

    // Load the configuration from the disk
    const content = JSON.parse((await readFile(configFile)).toString()) as Config;

    return content;
}

export { loadConfig };
