import { DatabaseMetadata} from "../ColumnInformation/DatabaseMetadata";
import { DbParameter } from "../ColumnInformation/DbParameter";

export interface IDbRepository {
    getDatabaseMetadata(dbName: string): Promise<DatabaseMetadata>;
    saveColumns(rows: Array<Array<DbParameter>>, dbName: string, tableName: string): Promise<number>;
}