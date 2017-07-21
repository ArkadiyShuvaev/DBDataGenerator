import {ColumnInformation} from "../ColumnInformation/ColumnInformation";
import {RowColumnInformation} from "../ColumnInformation/RowColumnInformation";

export interface IDataGenerator {
    generateRandomValues(columnInformation: ColumnInformation, generatedRowCount: number, percentOfNull?: number): Array<RowColumnInformation>;
}
