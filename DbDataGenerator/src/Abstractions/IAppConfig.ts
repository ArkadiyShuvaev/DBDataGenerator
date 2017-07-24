export interface IAppConfig {
    connectionSettings: {
        userName: string;
        password: string;
        server: string;
    };
    databases: Array<IDbSettings>;
}

export interface IColumnSettings {
    name: string;
    dataType: string;
    regularExpression: string;
    allowNulls: boolean;
    percentOfNullsPerColumn: number;
}

export interface ITableSettings {
    name: string;
    columns: Array<IColumnSettings>;
    generatedRowCount: number;
    percentOfNullsPerColumn: number;
}

export interface IDbSettings {
    name: string;
    tables: Array<ITableSettings>;
    percentOfNullsPerColumn: number;
    generatedRowCount: number;
}