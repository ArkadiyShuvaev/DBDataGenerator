import {IDbRepository} from "../Abstractions/IDbRepository";
import {IDataGenerator} from "../Abstractions/IDataGenerator";
import { IAppConfig, IDbConfigSettings, ITableConfigSettings, IColumnConfigSettings } from "../Abstractions/IAppConfig";
import {ILogger} from "../Logger/ILogger";
import {DbParameter} from "../ColumnInformation/DbParameter";
import {ColumnMetadata} from "../ColumnInformation/ColumnMetadata";
import {DataGeneratorInvoker} from "./DataGeneratorInvoker";
import {DatabaseMetadata} from "../ColumnInformation/DatabaseMetadata";

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

    async populateDb(dbSettings: IDbConfigSettings): Promise<void> {
        
        const databaseMetadata = await this.repository.getDatabaseMetadata(dbSettings.name);
        const tableNames = this.getTableNames(dbSettings, databaseMetadata);
        
        for (let tableName of tableNames) {

            const rows: Array<Array<DbParameter>> = [];
            
            const filteredTableSettings = dbSettings.specificTableSettings.filter(
                                                    settings => settings.tableName === tableName);
            const tableConfigSettings = (filteredTableSettings == null || filteredTableSettings.length === 0)
                ? null
                : filteredTableSettings[0];

            const generatedRowCount = (tableConfigSettings == null || tableConfigSettings.generatedRowCount == null)
                    ? dbSettings.generatedRowCount
                    : tableConfigSettings.generatedRowCount;
            
            for (let rowIndex = 0; rowIndex < generatedRowCount; rowIndex++) {
                rows[rowIndex] = [];
            }

            const columnsMetadataByTableName = databaseMetadata.informations.filter(ci => ci.tableName === tableName);
            for (let filteredColMeta of columnsMetadataByTableName) {

                if (filteredColMeta.isIdentity) {
                    this.logger.debug(
                        `The 'Identity' property of the '${filteredColMeta.parameterName}' column is True and this column will be skipped.`);
                    continue;
                }

                let columnGlobalSettings: IColumnConfigSettings | null = null;

                if (tableConfigSettings != null && tableConfigSettings.columns != null) {
                    columnGlobalSettings = tableConfigSettings.columns.filter(settings => {
                        return settings.name.toLowerCase() === filteredColMeta.parameterName.toLowerCase();
                    })[0];

                    columnGlobalSettings = columnGlobalSettings || null;
                }

                const percentOfNullsPerColumn =
                    this.getPercentOfNullValuesPerColumn(tableConfigSettings, columnGlobalSettings, filteredColMeta, dbSettings);
                
                const colRandomValues = this.createRandomColumnData(filteredColMeta, generatedRowCount, percentOfNullsPerColumn, columnGlobalSettings);

                for (let rowIndex = 0; rowIndex < generatedRowCount; rowIndex++) {
                    const row = rows[rowIndex];
                    const value = colRandomValues[rowIndex];
                    row.push(value);
                }
            }

            const result = await this.repository.saveColumns(rows, dbSettings.name, tableName);

        }
    }

    private createRandomColumnData(columnMeta: ColumnMetadata, generatedRowCount: number, percentOfNullsPerColumn: number, columnGlobalSettings: IColumnConfigSettings | null): DbParameter[] {
        
        const result: Array<DbParameter> = [];
        
        const randomValues = this.dataGeneratorInvoker.invokeDataGenerator(columnMeta, generatedRowCount, percentOfNullsPerColumn, columnGlobalSettings);
        
        for (let i = 0; i < generatedRowCount; i++) {

            const dbParam = new DbParameter();
            dbParam.isNulluble = columnMeta.isNulluble;
            dbParam.parameterName = columnMeta.parameterName;
            dbParam.characterMaximumLength = columnMeta.characterMaximumLength;
            dbParam.value = randomValues[i];
            dbParam.dbType = columnMeta.dbType;
            dbParam.isIdentity = columnMeta.isIdentity;
            dbParam.numericPrecision = columnMeta.numericPrecision;
            dbParam.numericScale = columnMeta.numericScale;

            result.push(dbParam);
        }
        return result;
    }

    private getPercentOfNullValuesPerColumn(tableSettings: ITableConfigSettings | null, columnGlobalSettings: IColumnConfigSettings | null, dbColumnMeta: ColumnMetadata, dbSettings: IDbConfigSettings): number {

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

    getTableNames(dbConfigSettings: IDbConfigSettings, databaseMetadata: DatabaseMetadata): Array<string> {
        
        if (dbConfigSettings.includedTableNames != null && dbConfigSettings.includedTableNames.length > 0) {
            return dbConfigSettings.includedTableNames;
        }

        const tableLists = databaseMetadata.relationships.map(rel => rel.parentTableName);
        const uniqTableNames = tableLists.filter((item, idx, tableLists) => {
            return tableLists.indexOf(item) === idx;
        });

        const excludedTableNames = dbConfigSettings.excludedTableNames || [];

        if (excludedTableNames.length > 0) {
            return uniqTableNames.filter((item, idx, excludedTableNames) => {
                return excludedTableNames.indexOf(item) === -1;
            });
        }

        return uniqTableNames;
    }
    
}
