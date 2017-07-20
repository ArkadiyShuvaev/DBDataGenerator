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

    fillOut(): any {
        for (let db of this.config.databases) {
            this.fillOutDb(db);
        }
    }

    fillOutDb(dbSettings: IDbSettings): void {
        for (let table of dbSettings.tables) {

            const tableColumns = this.repository.getColumnMetadata(dbSettings.name);
            tableColumns.then(columnInfos => {
                var cis = columnInfos;
            });
        }
    }

    //fillOutTable(tableSettings: ITableSettings, dbSettings: IDbSettings): void {
    //    const tableColumns = this.repository.getColumnMetadatas(tableSettings.name, dbSettings.name);
    //    tableColumns.then(columnInfos => {
    //        var cis = columnInfos;
    //    });
    //}
}