import {DbParameter} from "../ColumnInformation/DbParameter";
import {DbType} from "../ColumnInformation/DbType";
import {IntGenerationSettings, CharacterGenerationSettings, DecimalGenerationSettings } from "../Abstractions/IGenerationSettings";

import {IDataGenerator} from "../Abstractions/IDataGenerator";
import {IColumnConfigSettings} from "../Abstractions/IAppConfig";

export class DataGeneratorInvoker {
    private readonly generator;

    constructor(generator: IDataGenerator) {
        this.generator = generator;
    }


    invokeDataGenerator(columnMeta: DbParameter,
                        generatedRowCount: number,
                        percentOfNullsPerColumn: number,
                        columnGlobalSettings: IColumnConfigSettings | null): Array<Object | null> {

        switch (columnMeta.dbType) {
            case DbType.Int:
                const intSettings = new IntGenerationSettings(columnMeta.isNulluble);
                intSettings.minimalValue = this.getMinimumIntValue(intSettings.minimalValue, columnGlobalSettings);
                intSettings.maximumValue = this.getMaximumIntValue(intSettings.maximumValue, columnGlobalSettings);
                return this.generator.generateRandomIntValues(intSettings, generatedRowCount, percentOfNullsPerColumn);

            case DbType.SmallInt:
                const int16Settings = new IntGenerationSettings(columnMeta.isNulluble);
                int16Settings.minimalValue = this.getMinimumIntValue(-32768, columnGlobalSettings);
                int16Settings.maximumValue = this.getMaximumIntValue(32767, columnGlobalSettings);
                return this.generator.generateRandomIntValues(int16Settings, generatedRowCount, percentOfNullsPerColumn);

            case DbType.TinyInt:
                const int8Settings = new IntGenerationSettings(columnMeta.isNulluble);
                int8Settings.minimalValue = this.getMinimumIntValue(0, columnGlobalSettings);
                int8Settings.maximumValue = this.getMaximumIntValue(255, columnGlobalSettings);
                return this.generator.generateRandomIntValues(int8Settings, generatedRowCount, percentOfNullsPerColumn);


            case DbType.Char:
            case DbType.NChar:
            case DbType.VarChar:
            case DbType.NVarChar:

                const columnRegularExpression =
                    (columnGlobalSettings == null || columnGlobalSettings.regularExpression == null)
                        ? ""
                        : columnGlobalSettings.regularExpression;

                const charSettings = new CharacterGenerationSettings(columnMeta.isNulluble, columnMeta.characterMaximumLength);
                charSettings.regularExpression = columnRegularExpression;

                return this.generator.generateRandomCharacterValues(charSettings, generatedRowCount, percentOfNullsPerColumn);

            case DbType.Decimal:
                const decimalSettings = new DecimalGenerationSettings(columnMeta.isNulluble);
                decimalSettings.precision = this.getPrecision(columnMeta.numericPrecision, columnGlobalSettings);
                decimalSettings.scale = this.getScale(columnMeta.numericScale, columnGlobalSettings);

                return this.generator.generateRandomDecimalValues(decimalSettings, generatedRowCount, percentOfNullsPerColumn);

            default:
                throw new TypeError(
                    `The '${DbType[columnMeta.dbType]}' dbType of the '${columnMeta.parameterName
                    }' column is not supported.`);

        }

    }

    private getMinimumIntValue(defaultValue: number, columnGlobalSettings: IColumnConfigSettings | null): number {
        return columnGlobalSettings == null || columnGlobalSettings.minimumNumber == null
            ? defaultValue
            : columnGlobalSettings.minimumNumber;
    }

    private getMaximumIntValue(defaultValue: number, columnGlobalSettings: IColumnConfigSettings | null): number {
        return columnGlobalSettings === null
            ? defaultValue : (columnGlobalSettings.maximumNumber == null ? defaultValue : columnGlobalSettings.maximumNumber);
    }

    getPrecision(defaultValue: number, columnGlobalSettings: IColumnConfigSettings | null): number {
        return columnGlobalSettings == null || columnGlobalSettings.precision == null
            ? defaultValue
            : columnGlobalSettings.precision;
    }

    getScale(defaultValue: number, columnGlobalSettings: IColumnConfigSettings | null): number {
        return columnGlobalSettings == null || columnGlobalSettings.scale == null
            ? defaultValue
            : columnGlobalSettings.scale;
    }
}
