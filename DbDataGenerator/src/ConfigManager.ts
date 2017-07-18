import { IAppConfig } from "./Abstractions/IAppConfig";
import * as fs from "fs";

export class ConfigManager {
    constructor(configPath: string) {
        this.configPath = configPath;
    }

    getConfig(): IAppConfig {
        if (this.appConfig === null) {
            this.appConfig = JSON.parse(fs.readFileSync(this.configPath, this.encoding)) as IAppConfig;    
        }

        return this.appConfig;
    }

    private appConfig: IAppConfig = null;
    private encoding = "Utf8";
    private readonly configPath: string;
}