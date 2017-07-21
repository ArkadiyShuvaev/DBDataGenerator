import {BaseColumnInformation} from "./BaseColumnInformation";

export class ColumnInformation extends BaseColumnInformation {
    tableName: string;
    isNulluble: boolean;
    isKey: boolean;
    defaultValue: any;
    schemaName: string;
}