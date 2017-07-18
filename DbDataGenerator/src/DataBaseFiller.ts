import {IDbRepository} from "./Abstractions/IDbRepository";

export class DataBaseFiller {
    private readonly repository: IDbRepository;

    constructor(repository: IDbRepository) {
        this.repository = repository;
    }
}