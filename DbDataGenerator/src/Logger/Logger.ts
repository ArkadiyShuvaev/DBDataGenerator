import {ILogger} from "./ILogger";

export class Logger implements ILogger {
    debug(debugMessage: string): void {
        console.log(debugMessage); 
    }

    error(errorMessage: string): void {
        console.error(errorMessage);
    }

    info(infoMessage: string): void {
        console.log(infoMessage);
    }
}