import { IDataGenerator } from "./Abstractions/IDataGenerator";
import {ColumnInformation} from "./ColumnInformation/ColumnInformation";
import {RowColumnInformation} from "./ColumnInformation/RowColumnInformation";

export class DataGenerator implements IDataGenerator {

    generateRandomValues(columnInformation: ColumnInformation, generatedRowCount: number, percentOfNull: number): Array<RowColumnInformation> {

        if (generatedRowCount == null || (generatedRowCount < 0 || generatedRowCount > 100)) {
            throw new RangeError("generatedRowCount is out of range");
        }
        
        if (percentOfNull == null || (percentOfNull < 0 || percentOfNull > 100)) {
            throw new RangeError("percentOfNull is out of range");
        }


        const result: Array<RowColumnInformation> = [];

        for (let i = 0; i < generatedRowCount; i++) {
            const rowInfo = new RowColumnInformation();

            rowInfo.columnName = columnInformation.columnName;
            rowInfo.dataType = columnInformation.dataType;

            if (percentOfNull === 0) {
                rowInfo.value = i.toString();
            }
            if (percentOfNull === 100) {
                rowInfo.value = null;
            }

            const isValueShouldBeNull = (this.getRndInteger(0, 100) <= percentOfNull);

            rowInfo.value = isValueShouldBeNull ? null : this.getRndInteger(-2147483648, 2147483647).toString();

            result.push(rowInfo);
        }

        return result;
    }

    getString(): string { throw new Error("Not implemented"); }

    getInt32(): number { return this.getRndInteger(-2147483648, 2147483647) }

    getGuid(): string { throw new Error("Not implemented"); }

    private getRndInteger(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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