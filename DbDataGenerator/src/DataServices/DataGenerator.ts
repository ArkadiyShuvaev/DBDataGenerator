import { IDataGenerator } from "../Abstractions/IDataGenerator";
import { IIntGenerationSettings, ICharacterGenerationSettings, IBaseGenerationSettings } from "../Abstractions/IGenerationSettings";
//import {RandExp} from "randexp";
const RandExp: any = require("randexp");

export class DataGenerator implements IDataGenerator {


    generateRandomCharacterValues(generationSettings: ICharacterGenerationSettings,
        generatedRowCount: number, percentOfNulls: number): Array<string | null> {

        this.throwIfParamsAreNotValid(generationSettings, generatedRowCount, percentOfNulls);
        if (generationSettings.size == null) {
            throw new ReferenceError("generationSettings size parameter cannot be null");
        }

        return this.generateValues<string>(generatedRowCount, percentOfNulls, () => {

            let result: string;

            if (generationSettings.regularExpression == null || generationSettings.regularExpression === "") {
                result = new RandExp(`[a-z0-9._+-]{1,${generationSettings.size}}`).gen();
            } else {
                result = new RandExp(generationSettings.regularExpression).gen();
            }

            return result;
        });

    }


    generateRandomIntValues(generationSettings: IIntGenerationSettings, generatedRowCount: number,
        percentOfNulls: number): Array<number | null> {

        this.throwIfParamsAreNotValid(generationSettings, generatedRowCount, percentOfNulls);

        return this.generateValues<number>(generatedRowCount, percentOfNulls, () => {
            return this.getRndInteger(generationSettings.minimalValue, generationSettings.maximumValue);
        });
    }
    
    private generateValues<T>(generatedRowCount: number, percentOfNulls: number,
        generateFunc: () => T | null): Array<T | null> {

        if (percentOfNulls === 100) {

            return new Array(percentOfNulls).fill(null);

        } else if (percentOfNulls === 0) {
            return this.addValuesToArray<T>(generatedRowCount, () => {
                return generateFunc();
            });

        } else {

            return this.addValuesToArray<T>(generatedRowCount, () => {
                const isValueShouldBeNull = (this.getRndInteger(0, 100) <= percentOfNulls);
                return isValueShouldBeNull
                    ? null
                    : generateFunc();
            });
        }

    }

    private addValuesToArray<T>(generatedRowCount: number, func: () => T | null): Array<T | null> {

        const array: Array<T | null> = [];

        for (let i = 0; i < generatedRowCount; i++) {
            array.push(func());
        }

        return array;
    }
    
    private getRndInteger(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private throwIfParamsAreNotValid(settings: IBaseGenerationSettings, generatedRowCount: number, percentOfNull: number): void {
        if (settings == null) {
            throw new ReferenceError("settings cannot be null");
        }

        if (generatedRowCount == null) {
            throw new ReferenceError("generatedRowCount cannot be null");
        }
            
        if(generatedRowCount < 0 || generatedRowCount > 100) {
            throw new RangeError("generatedRowCount is out of range");
        }

        if (percentOfNull == null) {
            throw new ReferenceError("percentOfNull cannot be null");
        }

        if (percentOfNull < 0 || percentOfNull > 100) {
            throw new RangeError("percentOfNull is out of range");
        }
    }
}

export namespace DataGenerator {
    class Guid {
        private readonly str: string;

        constructor(str?: string) {
            this.str = str || Guid.createGuid();
        }

        toString() {
            return this.str;
        }

        private static createGuid() {
            // your favourite guid generation function could go here
            // ex: http://stackoverflow.com/a/8809472/188246
            let d = new Date().getTime();
            if (window.performance && typeof window.performance.now === "function") {
                d += performance.now(); //use high-precision timer if available
            }
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                const r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }
    }
}