export interface IAppConfig {
    connectionSettings: {
        userName: string;
        password: string;
        server: string;
    };
    databases: Array<IDbConfigSettings>;
}

export interface IColumnConfigSettings {
    name: string;
    dataType: string;
    regularExpression: string;
    allowNulls: boolean;
    percentOfNullsPerColumn: number;
    minimumNumber: number;
    maximumNumber: number;
}

export interface ITableConfigSettings {
    name: string;
    columns: Array<IColumnConfigSettings>;
    generatedRowCount: number;
    percentOfNullsPerColumn: number;
}

export interface IDbConfigSettings {
    name: string;
    includedTables: Array<ITableConfigSettings>;
    percentOfNullsPerColumn: number;
    generatedRowCount: number;
}