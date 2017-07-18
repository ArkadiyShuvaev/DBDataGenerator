import {IAppConfig} from "./Abstractions/IAppConfig";
import { IDbRepository } from "./Abstractions/IDbRepository";

export class DatabaseRepository implements IDbRepository {
    private readonly config: IAppConfig;

    constructor(config: IAppConfig) {
        this.config = config;
    }

    save(): boolean {
        return true;
    }
}