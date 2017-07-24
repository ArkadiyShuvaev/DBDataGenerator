import {IIntGenerationSettings, ICharacterGenerationSettings } from "./IGenerationSettings";

export interface IDataGenerator {
    generateRandomIntValues(generationSettings: IIntGenerationSettings,
        generatedRowCount: number, percentOfNullsPerColumn: number): Array<number>;
    generateRandomCharacterValues(characterGenerationSettings: ICharacterGenerationSettings,
        generatedRowCount: number, percentOfNullsPerColumn: number): Array<string>;
}
