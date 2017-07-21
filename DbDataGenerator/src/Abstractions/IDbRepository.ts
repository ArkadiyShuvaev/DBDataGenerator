import { ColumnInformations } from "../ColumnInformation/ColumnInformations";
import { RowColumnInformation } from "../ColumnInformation/RowColumnInformation";
import { Thenable } from "es6-promise";

export interface IDbRepository {
    getColumnMetadata(dbName: string): Thenable<ColumnInformations>;
    saveColumns(rows: Array<Array<RowColumnInformation>>, dbName: string, tableName: string): Thenable<number>;
}