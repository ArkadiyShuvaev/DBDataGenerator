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
    type: string;
}

export interface ITableSettings {
    name: string;
    columns: Array<IColumnSettings>;
    generatedRowCount: number;
    percentOfNull: number;
}

export interface IDbSettings {
    name: string;
    tables: Array<ITableSettings>;
}