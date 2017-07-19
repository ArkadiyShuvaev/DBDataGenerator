export class ColumnInformation {
    tableName: string;
    columnName: string;
    type: string; // Todo should be Type Enum
    isNulluble: boolean;
    key: string; //Todo should be Enum like PRI / Mul
    defaultValue: string;
}