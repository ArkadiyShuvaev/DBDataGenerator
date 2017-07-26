import {IAppConfig} from "../Abstractions/IAppConfig";
import { IDbRepository } from "../Abstractions/IDbRepository";
import { Connection, Request, ColumnValue } from "tedious";
import { ILogger } from "../Logger/ILogger";
import { DbParameter } from "../ColumnInformation/DbParameter";
import {ColumnMetadata} from "../ColumnInformation/ColumnMetadata";
import {DbType} from "../ColumnInformation/DbType";
import {TediousDbTypeConvertor as DbTypeTediousConvertor} from "./TediousDbTypeConvertor";
import {ColumnsMetadata} from "../ColumnInformation/ColumnsMetadata";

export class MsSqlDatabaseRepository implements IDbRepository {

    constructor(config: IAppConfig, logger: ILogger) {
        this.logger = logger;
        this.config = config;
    }

    saveColumns(rows: Array<Array<DbParameter>>, dbName: string, tableName: string): Promise<number> {

        return new Promise((resolve: (value?: number | PromiseLike<number>) => void, reject: (value?: Error) => void) => {

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

    getColumnMetadata(dbName: string): Promise<ColumnsMetadata> {

        return new Promise((resolve, reject) => {
            this.getTableMetadataImpl(dbName, resolve, reject);
        });
    }
    
    private getTableMetadataImpl(dbName: string,
        resolve: (value?: Object | PromiseLike<ColumnsMetadata>) => void, reject: (reason?: Error) => void): void {
        

        const columnInfos = new ColumnsMetadata();
        const connection = this.createConnection(dbName);
        
        const request =
            new Request(`select o.name as TABLE_NAME
	                            , c.collation_name as COLLATION_NAME
	                            , c.is_identity as IS_IDENTITY
	                            , c.name as COLUMN_NAME
	                            , ic.DATA_TYPE
	                            , ic.TABLE_SCHEMA
	                            , ic.IS_NULLABLE
	                            , ic.CHARACTER_MAXIMUM_LENGTH
	                            , ic.CHARACTER_SET_NAME
	
                            from sys.objects o
                            inner join sys.columns c on o.object_id = c.object_id
                            inner join INFORMATION_SCHEMA.COLUMNS as ic on ic.TABLE_NAME = o.name and ic.COLUMN_NAME = c.name
                            where o.name in 
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

        createColumnInformation(): ColumnMetadata {

            const colInfo = new ColumnMetadata();

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

            colValue = this.columns.filter(col => col.metadata.colName === "COLLATION_NAME")[0];
            colInfo.collationName = colValue.value;
            
            colValue = this.columns.filter(col => col.metadata.colName === "CHARACTER_SET_NAME")[0];
            colInfo.characterSetName = colValue.value;

            colValue = this.columns.filter(col => col.metadata.colName === "IS_IDENTITY")[0];
            colInfo.isIdentity = colValue.value;

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