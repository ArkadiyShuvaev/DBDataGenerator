import {IDbRepository} from "./Abstractions/IDbRepository";
import { IDataGenerator } from "./Abstractions/IDataGenerator";
import {IAppConfig, IDbSettings, ITableSettings } from "./Abstractions/IAppConfig";

export class DataBaseService {
    private readonly config: IAppConfig;
    private readonly generator: IDataGenerator;
    private readonly repository: IDbRepository;

    constructor(repository: IDbRepository, generator: IDataGenerator, config: IAppConfig) {
        this.config = config;
        this.generator = generator;
        this.repository = repository;
    }

    fillOutSync(): any {
        for (let db of this.config.databases) {
            this.fillOutDbSync(db);
        }
    }

    fillOutDbSync(dbSettings: IDbSettings): void {
        for (let table of dbSettings.tables) {
            this.fillOutTableSync(table);
        }
    }

    fillOutTableSync(tableSettings: ITableSettings): void {
        const tableColumns = this.repository.getTableMetadata(tableSettings.name);
    }
}