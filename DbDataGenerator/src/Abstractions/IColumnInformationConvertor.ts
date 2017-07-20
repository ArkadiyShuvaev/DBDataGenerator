import {ColumnInformation} from "../ColumnInformation/ColumnInformation";

export interface IColumnInformationConvertor {
    createColumnInformation(columns: Array<any>): ColumnInformation
}