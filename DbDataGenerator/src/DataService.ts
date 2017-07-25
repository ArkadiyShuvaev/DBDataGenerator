import {IDbRepository} from "./Abstractions/IDbRepository";
import {IDataGenerator} from "./Abstractions/IDataGenerator";
import {IAppConfig, IDbSettings, ITableSettings, IColumnSettings } from "./Abstractions/IAppConfig";
import {ILogger} from "./Logger/ILogger";
import {DbParameter} from "./ColumnInformation/DbParameter";
import {ColumnMetadata} from "./ColumnInformation/ColumnMetadata";
import {DbType} from "./ColumnInformation/DbType";
import {IntGenerationSettings, CharacterGenerationSettings } from "./Abstractions/IGenerationSettings";

export class DataService {
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

                let columnGlobalSettings: IColumnSettings = null;

                if (tableSettings.columns != null) {
                    columnGlobalSettings = tableSettings.columns.filter(settings => {
                        return settings.name.toLowerCase() === filteredColMeta.parameterName.toLowerCase();
                    })[0];
                }

                const percentOfNullsPerColumn =
                    this.getPercentOfNullValuePerColumn(tableSettings, columnGlobalSettings, filteredColMeta, dbSettings);

                const columnRegularExpression = columnGlobalSettings == null ? null : (columnGlobalSettings.regularExpression == null ? null : columnGlobalSettings.regularExpression);
                const colRandomValues = this.createColumnData(filteredColMeta, generatedRowCount, percentOfNullsPerColumn, columnRegularExpression);

                for (let rowIndex = 0; rowIndex < generatedRowCount; rowIndex++) {
                    const row = rows[rowIndex];
                    const value = colRandomValues[rowIndex];
                    row.push(value);
                }
            }

            const result = await this.repository.saveColumns(rows, dbSettings.name, tableSettings.name);

        }
    }

    private createColumnData(columnMeta: ColumnMetadata, generatedRowCount: number, percentOfNullsPerColumn: number, columnRegularExpression: string): DbParameter[] {
        
        const result: Array<DbParameter> = [];
        const randomValues = this.invokeDataGeneratorMethod(columnMeta, generatedRowCount, percentOfNullsPerColumn, columnRegularExpression);
        
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

    private getPercentOfNullValuePerColumn(tableSettings: ITableSettings, columnGlobalSettings: IColumnSettings, dbColumnMeta: ColumnMetadata, dbSettings: IDbSettings): number {

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

    private invokeDataGeneratorMethod(columnMeta: DbParameter, generatedRowCount: number, percentOfNullsPerColumn: number, columnRegularExpression: string): Object[] {

        switch (columnMeta.dbType) {
            case DbType.Int:
                const intSettings = new IntGenerationSettings(columnMeta.isNulluble);
                return this.generator.generateRandomIntValues(intSettings, generatedRowCount, percentOfNullsPerColumn);

            case DbType.SmallInt:
                const int16Settings = new IntGenerationSettings(columnMeta.isNulluble);
                int16Settings.minimalValue = -32768;
                int16Settings.maximumValue = 32767;
                return this.generator.generateRandomIntValues(int16Settings, generatedRowCount, percentOfNullsPerColumn);

            case DbType.TinyInt:
                const int8Settings = new IntGenerationSettings(columnMeta.isNulluble);
                int8Settings.minimalValue = 0;
                int8Settings.maximumValue = 255;
                return this.generator.generateRandomIntValues(int8Settings, generatedRowCount, percentOfNullsPerColumn);


            case DbType.Char:
            case DbType.NChar:
            case DbType.VarChar:
            case DbType.NVarChar:
                const charSettings = new CharacterGenerationSettings(columnMeta.isNulluble, columnMeta.size);
                charSettings.regularExpression = columnRegularExpression;
                return this.generator.generateRandomCharacterValues(charSettings, generatedRowCount, percentOfNullsPerColumn);

            default:
                throw new TypeError(
                    `The '${columnMeta.dbType.toString()}' dbType of the '${columnMeta.parameterName
                    }' column is not supported.`);

        }
    }
}