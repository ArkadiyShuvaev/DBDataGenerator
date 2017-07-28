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
    
    /**
     * For the Int types.
     * The minimum value of the generated data range. For example, the minimum value for the Int32 type is -2147483648.
     */
    minimumNumber: number;

    /**
     * For the Int types.
     * The minimum value of the generated data range. For example, the maximum value for the Int32 type is 2147483647.
     */
    maximumNumber: number;

    /**
     * For the decimal and numeric types.
     * The maximum total number of decimal digits that will be stored, both to the left and to the right of the decimal point.
     */
    precision: number;

    /**
     * For the decimal and numeric types.
     * The number of decimal digits that will be stored to the right of the decimal point.
     */
    scale: number;
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