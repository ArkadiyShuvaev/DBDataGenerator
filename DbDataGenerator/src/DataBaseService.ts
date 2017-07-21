import {IDbRepository} from "./Abstractions/IDbRepository";
import { IDataGenerator } from "./Abstractions/IDataGenerator";
import {IAppConfig, IDbSettings, ITableSettings } from "./Abstractions/IAppConfig";
import {ILogger} from "./Logger/ILogger";
import {RowColumnInformation} from "./ColumnInformation/RowColumnInformation";

export class DataBaseService {
    private readonly logger: ILogger;
    private readonly config: IAppConfig;
    private readonly generator: IDataGenerator;
    private readonly repository: IDbRepository;

    constructor(repository: IDbRepository, generator: IDataGenerator, config: IAppConfig, logger: ILogger) {
        this.logger = logger;
        this.config = config;
        this.generator = generator;
        this.repository = repository;
    }

    populate(): any {
        for (let db of this.config.databases) {
            this.populateDb(db);
        }
    }

    populateDb(dbSettings: IDbSettings): void {
        
        const tableColumns = this.repository.getColumnMetadata(dbSettings.name);
        tableColumns.then(columnInfos => {
            
            for (let table of dbSettings.tables) {
                const columns = columnInfos.informations.filter(ci => ci.tableName === table.name);
                
                const rows: Array<Array<RowColumnInformation>> = [];
                for (let rowIndex = 0; rowIndex < table.generatedRowCount; rowIndex++) {
                    rows[rowIndex] = [];
                }

                for (let column of columns) {

                    const colRandomValues =
                        this.generator.generateRandomValues(column, table.generatedRowCount, (table.percentOfNull == null) ? 0 : table.percentOfNull);

                    for (let rowIndex = 0; rowIndex < table.generatedRowCount; rowIndex++) {
                        const row = rows[rowIndex];
                        let value = colRandomValues[rowIndex];
                        row.push(value);
                    }
                    
                }
                var c = 5;
                this.repository.saveColumns(rows, dbSettings.name, table.name).then(result => {
                    var r = result;
                });

            }

        }).then(null, error => {
            this.logger.error(error);
            throw new Error(error);
        });

        
    }

    //fillOutTable(tableSettings: ITableSettings, dbSettings: IDbSettings): void {
    //    const tableColumns = this.repository.getColumnMetadatas(tableSettings.name, dbSettings.name);
    //    tableColumns.then(columnInfos => {
    //        var cis = columnInfos;
    //    });
    //}
}