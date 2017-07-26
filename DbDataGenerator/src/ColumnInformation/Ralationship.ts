import {ConstraintType} from "./ConstraintType";
import {DbType} from "./DbType";

export class Ralationship {
    constrainName: string;
    constraintType: ConstraintType;
    parentTableName: string;
    parentColumnName: string;
    parentColumnNameDataType: DbType;
    referenceTableName: string;
    referenceColumnName: string;
}