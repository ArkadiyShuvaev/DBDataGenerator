import {IAppConfig} from "../Abstractions/IAppConfig";
import { IDbRepository } from "../Abstractions/IDbRepository";
import { ColumnsMetadata as ColumnInformations } from "../ColumnInformation/ColumnsMetadata";
import { Connection, Request, ColumnValue } from "tedious";
import { ILogger } from "../Logger/ILogger";
import { Promise, Thenable } from "es6-promise";
import { DbParameter } from "../ColumnInformation/DbParameter";
import {ColumnMetadata as ColumnInformation} from "../ColumnInformation/ColumnMetadata";
import {DbType} from "../ColumnInformation/DbType";
import {TediousDbTypeConvertor as DbTypeTediousConvertor} from "./TediousDbTypeConvertor";

export class MsSqlDatabaseRepository implements IDbRepository {

    constructor(config: IAppConfig, logger: ILogger) {
        this.logger = logger;
        this.config = config;
    }

    saveColumns(rows: Array<Array<DbParameter>>, dbName: string, tableName: string): Thenable<number> {

        return new Promise((resolve: (value?: number) => void, reject: (value?: Error) => void) => {

            const connection = this.createConnection(dbName);

            const bulkLoad = connection.newBulkLoad(tableName, (error: Error, rowCount: number) => {

                connection.close();

                if (error) {
                    this.logger.error(error.toString());
                    reject(error);
                }

                resolve(rowCount);
            });
            
            for (let column of rows[0]) {
                bulkLoad.addColumn(column.parameterName, DbTypeTediousConvertor.convertToTediousSqlType(column.dbType), { length: column.size, nullable: column.isNulluble });
            }
            
            for (let row of rows) {

                const rowVal: any = {};
                row.forEach(col => {
                    rowVal[col.parameterName] = col.value;
                });

                bulkLoad.addRow(rowVal);
            }
            
            
            this.invokeFuncAfterConnectedEvent(connection, () => connection.execBulkLoad(bulkLoad));
            
        });
    }

    getColumnMetadata(dbName: string): Thenable<ColumnInformations> {

        return new Promise((resolve, reject) => {
            this.getTableMetadataImpl(dbName, resolve, reject);
        });
    }
    
    getTableMetadataImpl(dbName: string,
        resolve: (value?: Object | PromiseLike<ColumnInformations>) => void, reject: (reason?: Error) => void): any {

        const columnInfos = new ColumnInformations();
        const connection = this.createConnection(dbName);
        
        const request =
            new Request(`SELECT col.COLUMN_NAME, col.TABLE_NAME, col.TABLE_SCHEMA, 
                                col.COLUMN_DEFAULT, col.IS_NULLABLE, col.DATA_TYPE, 
                                col.CHARACTER_MAXIMUM_LENGTH, col.CHARACTER_OCTET_LENGTH, 
                                cu.CONSTRAINT_NAME, tc.CONSTRAINT_TYPE
                         FROM INFORMATION_SCHEMA.COLUMNS  as col
                         left join INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE as cu on col.COLUMN_NAME = cu.COLUMN_NAME
                         left join INFORMATION_SCHEMA.TABLE_CONSTRAINTS as tc on cu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
                         where col.TABLE_NAME in 
                            (
                                SELECT T.name as TableName FROM sys.tables AS T
                                INNER JOIN sys.schemas AS S ON S.schema_id = T.schema_id
                                LEFT JOIN sys.extended_properties AS EP ON EP.major_id = T.[object_id]
                                WHERE (EP.class_desc IS NULL 
                                    OR (EP.class_desc <> 'OBJECT_OR_COLUMN'
                                    AND EP.[name] <> 'microsoft_database_tools_support'))  
                            )`, 

                (error: Error) => {

                    connection.close();
                    
                    if (error) {
                        this.logger.error(error.toString());
                        reject(error);
                    }

                    resolve(columnInfos);
                }
        );
        
        this.executeRequest(connection, request, (columns: Array<ColumnValue>) => {
            const convertor = new MsSqlDatabaseRepository.ColumnInformationConvertor(columns);
            const colInfo = convertor.createColumnInformation();

            columnInfos.informations.push(colInfo);
        });
    }


    private readonly config: IAppConfig;
    private readonly logger: ILogger;

    executeRequest(connection: Connection, request: Request, func: Function) {

        request.on("row", (columns: Array<ColumnValue>) => {
            func(columns);
        });

        connection.on("debug", (debugMsg: string) => {
            this.logger.debug(debugMsg);
        });

        this.invokeFuncAfterConnectedEvent(connection, () => {connection.execSql(request)});
       
    }

    createConnection(dbName: string):Connection {
        const config = {
            userName: this.config.connectionSettings.userName,
            password: this.config.connectionSettings.password,
            server: this.config.connectionSettings.server,
            options: { database: dbName }
        };

        return new Connection(config);
    }
    
    invokeFuncAfterConnectedEvent(connection: Connection, func: Function): void {
        connection.on("connect",
            (err: Error) => {
                if (err == null) {
                    func();
                } else {
                    this.logger.error(err.toString());
                    throw new Error(err.toString());
                }
        });
    }
}

export namespace MsSqlDatabaseRepository {

    export class ColumnInformationConvertor {
        constructor(columns: Array<ColumnValue>) {
            this.columns = columns;
        }

        createColumnInformation(): ColumnInformation {

            const colInfo = new ColumnInformation();

            let colValue = this.columns.filter(col => col.metadata.colName === "DATA_TYPE")[0];

            colInfo.dbType = this.getDbType(colValue.value);

            colValue = this.columns.filter(col => col.metadata.colName === "CHARACTER_MAXIMUM_LENGTH")[0];
            colInfo.size = colValue.value;

            colValue = this.columns.filter(col => col.metadata.colName === "COLUMN_NAME")[0];
            colInfo.parameterName = colValue.value;

            colValue = this.columns.filter(col => col.metadata.colName === "IS_NULLABLE")[0];
            colInfo.isNulluble = !(colValue.value === "NO");

            colValue = this.columns.filter(col => col.metadata.colName === "TABLE_SCHEMA")[0];
            colInfo.schemaName = colValue.value;

            colValue = this.columns.filter(col => col.metadata.colName === "TABLE_NAME")[0];
            colInfo.tableName = colValue.value;

            colValue = this.columns.filter(col => col.metadata.colName === "COLUMN_DEFAULT")[0];
            colInfo.defaultValue = colValue.value;
            
            colValue = this.columns.filter(col => col.metadata.colName === "COLUMN_DEFAULT")[0];
            colInfo.defaultValue = colValue.value;

            colValue = this.columns.filter(col => col.metadata.colName === "CONSTRAINT_TYPE")[0];
            colInfo.isKey = !(colValue.value == null);

            return colInfo;
        }

        columns: Array<ColumnValue>;

        getDbType(value: string): DbType {
            
            switch (value.toLowerCase()) {
                case "int":
                    return DbType.Int;

                case "uniqueidentifier":
                    return DbType.UniqueIdentifier;

                case "nchar":
                    return DbType.NChar;

                case "nvarchar":
                    return DbType.NVarChar;

                case "char":
                    return DbType.Char;

                case "varchar":
                    return DbType.VarChar;

                case "bigint":
                    return DbType.BigInt;

                case "binary":
                    return DbType.Binary;

                case "bit":
                    return DbType.Bit;

                case "dateime":
                    return DbType.DateTime;

                case "decimal":
                    return DbType.Decimal;

                case "float":
                    return DbType.Float;

                case "image":
                    return DbType.Image;

                case "money":
                    return DbType.Money;

                case "ntext":
                    return DbType.NText;

                case "real":
                    return DbType.Real;

                case "smalldatetime":
                    return DbType.SmallDateTime;

                case "smallint":
                    return DbType.SmallInt;

                case "smallmoney":
                    return DbType.SmallMoney;

                case "text":
                    return DbType.Text;

                case "timestamp":
                    return DbType.Timestamp;

                case "tinyint":
                    return DbType.TinyInt;

                case "varbinary":
                    return DbType.VarBinary;

                case "variant":
                    return DbType.VarBinary;

                case "xml":
                    return DbType.Xml;

                case "udt":
                    return DbType.Udt;

                case "structured":
                    return DbType.Structured;

                case "date":
                    return DbType.Date;

                case "time":
                    return DbType.Time;

                case "datetime2":
                    return DbType.DateTime2;

                case "datetimeoffset":
                    return DbType.DateTimeOffset;

                default:
                    throw new Error("The column type cannot be determined");
            }
        }
    }
}