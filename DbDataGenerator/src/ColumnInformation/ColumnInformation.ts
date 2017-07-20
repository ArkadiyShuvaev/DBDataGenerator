import {ColumnTypeName} from "./ColumnTypeName";

export class ColumnInformation {
    tableName: string;
    columnName: string;
    dataType: ColumnTypeName;
    isNulluble: boolean;
    isKey: boolean;
    defaultValue: any;
    schemaName: string;
}