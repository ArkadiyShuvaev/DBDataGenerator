import { ColumnsMetadata as ColumnInformations } from "../ColumnInformation/ColumnsMetadata";
import { DbParameter } from "../ColumnInformation/DbParameter";
import { Thenable } from "es6-promise";

export interface IDbRepository {
    getColumnMetadata(dbName: string): Thenable<ColumnInformations>;
    saveColumns(rows: Array<Array<DbParameter>>, dbName: string, tableName: string): Thenable<number>;
}