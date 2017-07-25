import {DbType} from "./DbType";

export class DbParameter {
    parameterName: string;
    dbType: DbType;
    value: Object | null;
    isNulluble: boolean;
    size: number;
}