import { IDataGenerator } from "../Abstractions/IDataGenerator";
import { IIntGenerationSettings, ICharacterGenerationSettings, IBaseGenerationSettings, IDecimalGenerationSettings } from "../Abstractions/IGenerationSettings";

//import {RandExp} from "randexp";
const RandExp: any = require("randexp");

export class DataGenerator implements IDataGenerator {

    generateRandomDecimalValues(decimalGenerationSettings: IDecimalGenerationSettings,
        generatedRowCount: number, percentOfNullsPerColumn: number): (string | null)[] {

        this.throwIfParamsAreNotValid(decimalGenerationSettings, generatedRowCount, percentOfNullsPerColumn);
        if (decimalGenerationSettings.precision == null) {
            throw new ReferenceError("The precision parameter cannot be null");
        }
        if (decimalGenerationSettings.scale == null) {
            throw new ReferenceError("The scale parameter cannot be null");
        }

        const exponentValue = (decimalGenerationSettings.precision - decimalGenerationSettings.scale);
        const maxPrecisionValue = Math.pow(10, exponentValue) - 1; // if exponentValue = 3 => 10*10*10 - 1 = 999
        
        return this.generateValues<string>(generatedRowCount, percentOfNullsPerColumn, () => {

            const precisionRandomValue = this.getRndInteger(-maxPrecisionValue, maxPrecisionValue);
            const scaleRandomValue = new RandExp(`[0-9]{1,${decimalGenerationSettings.scale}}`).gen();
            const fixed = this.toFixedSpecial(precisionRandomValue);

            const result = `${fixed}.${scaleRandomValue}`;
            
            return result;
        });


    }

    toFixedSpecial(number: number) {
        const str = number.toFixed();
        if (str.indexOf("e+") < 0) {
            return str;
        }

        // if number is in scientific notation, pick (b)ase and (p)ower
        return str.replace(".", "").split("e+").reduce((p, b: any) =>
            p + Array(b - p.length + 2).join("0"));
    };

    generateRandomCharacterValues(generationSettings: ICharacterGenerationSettings,
        generatedRowCount: number, percentOfNullsPerColumn: number): Array<string | null> {

        this.throwIfParamsAreNotValid(generationSettings, generatedRowCount, percentOfNullsPerColumn);
        if (generationSettings.length == null) {
            throw new ReferenceError("generationSettings size parameter cannot be null");
        }

        return this.generateValues<string>(generatedRowCount, percentOfNullsPerColumn, () => {

            let result: string;
            // todo should be refactoring - move expression to the invoking class
            if (generationSettings.regularExpression == null || generationSettings.regularExpression === "") {
                result = new RandExp(`[a-z0-9._+-]{1,${generationSettings.length}}`).gen();
            } else {
                result = new RandExp(generationSettings.regularExpression).gen();
            }

            return result;
        });

    }


    generateRandomIntValues(generationSettings: IIntGenerationSettings, generatedRowCount: number,
        percentOfNullsPerColumn: number): Array<number | null> {

        this.throwIfParamsAreNotValid(generationSettings, generatedRowCount, percentOfNullsPerColumn);

        return this.generateValues<number>(generatedRowCount, percentOfNullsPerColumn, () => {
            return this.getRndInteger(generationSettings.minimalValue, generationSettings.maximumValue);
        });
    }
    
    private generateValues<T>(generatedRowCount: number, percentOfNullsPerColumn: number,
        generateFunc: () => T | null): Array<T | null> {

        if (percentOfNullsPerColumn === 100) {

            return new Array(percentOfNullsPerColumn).fill(null);

        } else if (percentOfNullsPerColumn === 0) {
            return this.addValuesToArray<T>(generatedRowCount, () => {
                return generateFunc();
            });

        } else {

            return this.addValuesToArray<T>(generatedRowCount, () => {
                const isValueShouldBeNull = (this.getRndInteger(0, 100) <= percentOfNullsPerColumn);
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

    private throwIfParamsAreNotValid(settings: IBaseGenerationSettings, generatedRowCount: number, percentOfNullsPerColumn: number): void {
        if (settings == null) {
            throw new ReferenceError("settings cannot be null");
        }

        if (generatedRowCount == null) {
            throw new ReferenceError("generatedRowCount cannot be null");
        }
            
        if(generatedRowCount < 0 || generatedRowCount > 100) {
            throw new RangeError("generatedRowCount is out of range");
        }

        if (percentOfNullsPerColumn == null) {
            throw new ReferenceError("percentOfNullsPerColumn cannot be null");
        }

        if (percentOfNullsPerColumn < 0 || percentOfNullsPerColumn > 100) {
            throw new RangeError("percentOfNullsPerColumn is out of range");
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