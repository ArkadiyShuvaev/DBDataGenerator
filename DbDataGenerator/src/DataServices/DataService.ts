import {IDbRepository} from "../Abstractions/IDbRepository";
import {IDataGenerator} from "../Abstractions/IDataGenerator";
import {IAppConfig, IDbSettings, ITableSettings, IColumnSettings } from "../Abstractions/IAppConfig";
import {ILogger} from "../Logger/ILogger";
import {DbParameter} from "../ColumnInformation/DbParameter";
import {ColumnMetadata} from "../ColumnInformation/ColumnMetadata";
import {DataGeneratorInvoker} from "./DataGeneratorInvoker";

export class DataService {
    private readonly logger: ILogger;
    private readonly config: IAppConfig;
    private readonly generator: IDataGenerator;
    private readonly repository: IDbRepository;
    private readonly dataGeneratorInvoker: DataGeneratorInvoker;

    constructor(repository: IDbRepository, generator: IDataGenerator, config: IAppConfig, logger: ILogger) {
        this.logger = logger;
        this.config = config;
        this.generator = generator;
        this.repository = repository;
        this.dataGeneratorInvoker = new DataGeneratorInvoker(this.generator);
    }

    populate(): any {
        for (let db of this.config.databases) {
            this.populateDb(db);
        }
    }

    async populateDb(dbSettings: IDbSettings): Promise<void> {
        
        const tableColumns = await this.repository.getColumnMetadata(dbSettings.name);

        for (let tableSettings of dbSettings.tables) {

            const rows: Array<Array<DbParameter>> = [];
            const generatedRowCount = tableSettings.generatedRowCount || dbSettings.generatedRowCount;
            const filteredColumnsMetadata = tableColumns.informations.filter(ci => ci.tableName === tableSettings.name);

            for (let rowIndex = 0; rowIndex < generatedRowCount; rowIndex++) {
                rows[rowIndex] = [];
            }


            for (let filteredColMeta of filteredColumnsMetadata) {

                let columnGlobalSettings: IColumnSettings | null = null;

                if (tableSettings.columns != null) {
                    columnGlobalSettings = tableSettings.columns.filter(settings => {
                        return settings.name.toLowerCase() === filteredColMeta.parameterName.toLowerCase();
                    })[0];

                    columnGlobalSettings = columnGlobalSettings || null;
                }

                const percentOfNullsPerColumn =
                    this.getPercentOfNullValuePerColumn(tableSettings, columnGlobalSettings, filteredColMeta, dbSettings);
                
                const colRandomValues = this.createColumnData(filteredColMeta, generatedRowCount, percentOfNullsPerColumn, columnGlobalSettings);

                for (let rowIndex = 0; rowIndex < generatedRowCount; rowIndex++) {
                    const row = rows[rowIndex];
                    const value = colRandomValues[rowIndex];
                    row.push(value);
                }
            }

            const result = await this.repository.saveColumns(rows, dbSettings.name, tableSettings.name);

        }
    }

    private createColumnData(columnMeta: ColumnMetadata, generatedRowCount: number, percentOfNullsPerColumn: number, columnGlobalSettings: IColumnSettings | null): DbParameter[] {
        
        const result: Array<DbParameter> = [];
        
        const randomValues = this.dataGeneratorInvoker.invokeDataGenerator(columnMeta, generatedRowCount, percentOfNullsPerColumn, columnGlobalSettings);
        
        for (let i = 0; i < generatedRowCount; i++) {

            const dbParam = new DbParameter();
            dbParam.isNulluble = columnMeta.isNulluble;
            dbParam.parameterName = columnMeta.parameterName;
            dbParam.size = columnMeta.size;
            dbParam.value = randomValues[i];
            dbParam.dbType = columnMeta.dbType;

            result.push(dbParam);
        }
        return result;
    }

    private getPercentOfNullValuePerColumn(tableSettings: ITableSettings, columnGlobalSettings: IColumnSettings | null, dbColumnMeta: ColumnMetadata, dbSettings: IDbSettings): number {

        if (dbColumnMeta.isNulluble === false) {
            return 0;
        }

        if (columnGlobalSettings != null && columnGlobalSettings.percentOfNullsPerColumn != null) {
            return columnGlobalSettings.percentOfNullsPerColumn;
        }  
        
        if (tableSettings != null && tableSettings.percentOfNullsPerColumn != null) {
            return tableSettings.percentOfNullsPerColumn;
        }

        return (dbSettings.percentOfNullsPerColumn == null) ? 0 : dbSettings.percentOfNullsPerColumn;
    }

}
