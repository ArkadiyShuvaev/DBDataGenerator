import {DbType} from "./DbType";

export class DbParameter {
    parameterName: string;
    dbType: DbType;
    value: Object | null;
    isIdentity: boolean;
    isNulluble: boolean;
    characterMaximumLength: number;
    numericPrecision: number;
    numericScale: number;
}