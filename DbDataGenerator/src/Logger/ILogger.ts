export interface ILogger {
    error(errorMessage: string): void;
    info(infoMessage: string): void;
    debug(debugMessage: string): void;
}