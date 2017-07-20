import { ColumnInformations } from "../ColumnInformation/ColumnInformations";
import { Thenable } from "es6-promise";

export interface IDbRepository {
    getColumnMetadata(dbName: string): Thenable<ColumnInformations>;
}