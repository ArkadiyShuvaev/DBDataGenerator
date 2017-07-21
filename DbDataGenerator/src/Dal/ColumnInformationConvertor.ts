import {IColumnInformationConvertor} from "../Abstractions/IColumnInformationConvertor";
import {ColumnInformation} from "../ColumnInformation/ColumnInformation";
import {ColumnValue} from "tedious";
import {ColumnTypeName} from "../ColumnInformation/ColumnTypeName";

export class ColumnInformationConvertor implements IColumnInformationConvertor {
    constructor(columns: Array<ColumnValue>) {
        this.columns = columns;
    }
    createColumnInformation(): ColumnInformation {

        const colInfo = new ColumnInformation();

        let colValue = this.columns.filter(col => col.metadata.colName === "DATA_TYPE")[0];

        //colInfo.dataType = ColumnTypeName[colValue.value.toString()];
        colInfo.dataType = this.getDataType(colValue.value);
        

        colValue = this.columns.filter(col => col.metadata.colName === "COLUMN_NAME")[0];
        colInfo.columnName = colValue.value;

        colValue = this.columns.filter(col => col.metadata.colName === "IS_NULLABLE")[0];
        colInfo.isNulluble = !(colValue.value === "NO");

        colValue = this.columns.filter(col => col.metadata.colName === "TABLE_SCHEMA")[0];
        colInfo.schemaName = colValue.value;
        
        colValue = this.columns.filter(col => col.metadata.colName === "TABLE_NAME")[0];
        colInfo.tableName = colValue.value;

        colValue = this.columns.filter(col => col.metadata.colName === "COLUMN_DEFAULT")[0];
        colInfo.defaultValue = colValue.value;

        colValue = this.columns.filter(col => col.metadata.colName === "COLUMN_DEFAULT")[0];
        colInfo.defaultValue = colValue.value;

        colValue = this.columns.filter(col => col.metadata.colName === "COLUMN_DEFAULT")[0];
        colInfo.defaultValue = colValue.value;

        colValue = this.columns.filter(col => col.metadata.colName === "CONSTRAINT_TYPE")[0];
        colInfo.isKey = !(colValue.value == null);

        return colInfo;
    }

    columns: Array<ColumnValue>;

    getDataType(value: string): ColumnTypeName {
        switch (value.toLowerCase()) {
            case "int":
                return ColumnTypeName.Int;
            case "uniqueidentifier":
                return ColumnTypeName.UniqueIdentifier;
            default:
                return ColumnTypeName.Unknown;
        }
    }
}