import {DbParameter} from "./DbParameter";

export class ColumnMetadata extends DbParameter {
    tableName: string;
    collationName: any;
    schemaName: string;
    characterSetName: string;
}