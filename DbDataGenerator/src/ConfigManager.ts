import { IAppConfig } from "./Abstractions/IAppConfig";
import * as fs from "fs";

export class ConfigManager {
    
    constructor(configPath: string) {

        if (configPath == null) {
            throw new ReferenceError("configPath cannot be null");
        }

        this.configPath = configPath;
    }

    getConfig(): IAppConfig {

        if (this.appConfig == null) {
            let appConfig = JSON.parse(fs.readFileSync(this.configPath, this.encoding)) as IAppConfig;

            appConfig = this.validateAndSetDefaultValues(appConfig);
            this.appConfig = appConfig;
        }
        

        return this.appConfig;
    }

    private appConfig: IAppConfig;
    private encoding = "Utf8";
    private readonly configPath: string;

    private readonly percentOfNullsPerColumnDefaultValue: number = 50;
    private readonly generatedRowCountDefaultValue: number = 100;

    private validateAndSetDefaultValues(appConfig: IAppConfig): IAppConfig {

        if (appConfig.databases == null) {
            throw new Error(`Please define at least one database in the ${this.configPath} config file.`);
        }
        
        appConfig.databases.forEach(dbSettings => {

            if (dbSettings.percentOfNullsPerColumn == null) {
                dbSettings.percentOfNullsPerColumn = this.percentOfNullsPerColumnDefaultValue;
            }

            if (dbSettings.generatedRowCount == null) {
                dbSettings.generatedRowCount = this.generatedRowCountDefaultValue;
            }

            if (dbSettings.includedTables == null) {
                dbSettings.includedTables = [];
            }
        });
        
        return appConfig;

        //appConfig.databases.forEach(dbSettings => {

        //    dbSettings.includedTables.forEach(tableSettings => {

        //        if (tableSettings.percentOfNullsPerColumn == null) {
        //            this.PercentOfNullsPerColumnDefaultValue = 50;
        //            tableSettings.percentOfNullsPerColumn = this.PercentOfNullsPerColumnDefaultValue;
        //        }

        //        shouldSettingsBeReturnWoFutherProcessing = true;
        //    });


        //});


    }
}