import {DbParameter} from "./DbParameter";

export class ColumnMetadata extends DbParameter {
    tableName: string;
    isKey: boolean;
    defaultValue: any;
    schemaName: string;
}