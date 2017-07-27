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
    tableName: string;
    columns: Array<IColumnConfigSettings>;
    generatedRowCount: number;
    percentOfNullsPerColumn: number;
}

export interface IDbConfigSettings {
    name: string;
    /**
     * Table array list names that should be processed.
     * If this list is empty all tables in the database will be iterated.
     */
    includedTableNames: Array<string>;

    /**
     * Excluded table array list names that should not be processed.
     * If this list is empty all tables in the database will be iterated.
     */
    excludedTableNames: Array<string>;

    /**
     * Please define specific settings for the particular table.
     * Please keep in mind this property clarify settings for the processed tables only.
     * @see {@link excludedTableNames}
     * @see {@link includedTableNames}
     */
    specificTableSettings: Array<ITableConfigSettings>;
    percentOfNullsPerColumn: number;
    generatedRowCount: number;
}