import {ColumnInformations} from "../ColumnInformations";

export interface IDbRepository {
    save(): boolean;
    getTableMetadata(name: string): ColumnInformations;
}