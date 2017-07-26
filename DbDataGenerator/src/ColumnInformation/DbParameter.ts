import {DbType} from "./DbType";

export class DbParameter {
    parameterName: string;
    dbType: DbType;
    value: Object | null;
    isIdentity: boolean;
    isNulluble: boolean;
    size: number;
}