import { join } from "path";
import { homedir } from "os";
import { readFile, stat, writeFile } from "fs/promises";

interface Config {
    registry: string;
}

const defaultConfig: Config = {
    registry: 'http://localhost:3000'
}

const loadConfig: () => Promise<Config> = async () => {
    const home = homedir();
    const configFile = join(home, '.vspxr');

    try {
        await stat(configFile);
    } catch {
        await writeFile(configFile, JSON.stringify(defaultConfig));
    }

    const content = JSON.parse((await readFile(configFile)).toString()) as Config;

    return content;
}

export { loadConfig };
