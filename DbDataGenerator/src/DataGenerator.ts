import { IDataGenerator } from "./Abstractions/IDataGenerator";

export class DataGenerator implements IDataGenerator {
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