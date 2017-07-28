import {IIntGenerationSettings, ICharacterGenerationSettings, IDecimalGenerationSettings } from "./IGenerationSettings";

export interface IDataGenerator {
    generateRandomIntValues(generationSettings: IIntGenerationSettings,
        generatedRowCount: number, percentOfNullsPerColumn: number): Array<number | null>;
    generateRandomCharacterValues(characterGenerationSettings: ICharacterGenerationSettings,
        generatedRowCount: number, percentOfNullsPerColumn: number): Array<string | null>;
    generateRandomDecimalValues(decimalGenerationSettings: IDecimalGenerationSettings,
        generatedRowCount: number, percentOfNullsPerColumn: number): Array<string | null>;
}
