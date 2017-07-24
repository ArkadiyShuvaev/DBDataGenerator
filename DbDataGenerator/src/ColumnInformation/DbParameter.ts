import {DbType} from "./DbType";

export class DbParameter {
    parameterName: string;
    dbType: DbType;
    value: Object;
    isNulluble: boolean;
    size: number;
}