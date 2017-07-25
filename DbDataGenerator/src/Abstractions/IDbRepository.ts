import { ColumnsMetadata } from "../ColumnInformation/ColumnsMetadata";
import { DbParameter } from "../ColumnInformation/DbParameter";
import { Thenable } from "es6-promise";

export interface IDbRepository {
    getColumnMetadata(dbName: string): Promise<ColumnsMetadata>;
    saveColumns(rows: Array<Array<DbParameter>>, dbName: string, tableName: string): Promise<number>;
}