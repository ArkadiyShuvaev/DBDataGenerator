import {DbParameter} from "../ColumnInformation/DbParameter";
import {DbType} from "../ColumnInformation/DbType";
import {IntGenerationSettings, CharacterGenerationSettings } from "../Abstractions/IGenerationSettings";

import {IDataGenerator} from "../Abstractions/IDataGenerator";

export class DataGeneratorInvoker {
    private readonly generator;

    constructor(generator: IDataGenerator) {
        this.generator = generator;
    }

    invokeDataGenerator(columnMeta: DbParameter, generatedRowCount: number, percentOfNullsPerColumn: number,
            columnRegularExpression: string): Array<Object | null> {

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
            return this.generator.generateRandomCharacterValues(charSettings,
                generatedRowCount,
                percentOfNullsPerColumn);

        default:
            throw new TypeError(
                `The '${columnMeta.dbType.toString()}' dbType of the '${columnMeta.parameterName
                }' column is not supported.`);

        }

    }
}
