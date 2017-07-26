import {IAppConfig} from "../Abstractions/IAppConfig";
import { IDbRepository } from "../Abstractions/IDbRepository";
import { Connection, Request, ColumnValue } from "tedious";
import { ILogger } from "../Logger/ILogger";
import { DbParameter } from "../ColumnInformation/DbParameter";
import {ColumnMetadata} from "../ColumnInformation/ColumnMetadata";
import {DbType} from "../ColumnInformation/DbType";
import {TediousDbTypeConvertor as DbTypeTediousConvertor} from "./TediousDbTypeConvertor";
import {DatabaseMetadata} from "../ColumnInformation/DatabaseMetadata";
import {Ralationship} from "../ColumnInformation/Ralationship";
import {ConstraintType} from "../ColumnInformation/ConstraintType";

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

    async getDatabaseMetadata(dbName: string): Promise<DatabaseMetadata> {

        const databaseMetadata = new DatabaseMetadata();
        databaseMetadata.relationships = await this.getDatabaseRepationships(dbName);
        databaseMetadata.informations = await this.getColumnsMetadata(dbName);

        return new Promise((resolve: (value: DatabaseMetadata) => void, reject: (reason?: Error) => void) => {
            resolve(databaseMetadata);
        });
    }


    private getColumnsMetadata(dbName: string): Promise<Array<ColumnMetadata>> {

        return new Promise((resolve, reject) => {
            const columnMetadata: Array<ColumnMetadata> = [];

            const connection = this.createConnection(dbName);
            const request = new Request(this.selectColumnsMetadataQuery, (error: Error) => {

                connection.close();

                if (error) {
                    this.logger.error(error.toString());
                    reject(error);
                }

                resolve(columnMetadata);
            });

            this.executeRequest(connection, request, (columns: Array<ColumnValue>) => {
                const convertor = new MsSqlDatabaseRepository.ColumnMetadataConvertor(columns);
                const colInfo = convertor.createColumnInformation();

                columnMetadata.push(colInfo);
            });
            
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

    getDatabaseRepationships(dbName: string): Promise<Array<Ralationship>> {

        return new Promise((resolve, reject) => {
            const relationShips: Array<Ralationship> = [];

            const connection = this.createConnection(dbName);
            
            const request = new Request(this.selectRelationshipsQuery, (error: Error) => {
                connection.close();
                if (error) {
                    this.logger.error(error.toString());
                    reject(error);
                }

                resolve(relationShips);
            });

            this.executeRequest(connection, request, (columns: Array<ColumnValue>) => {
                const convertor = new MsSqlDatabaseRepository.RelationshipMetadataConvertor(columns);
                const colInfo = convertor.createRelationship();

                relationShips.push(colInfo);
            });


        });
   

    }

    private selectColumnsMetadataQuery = `select o.name as TABLE_NAME
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
                                                    LEFT JOIN sys.extended_properties AS EP ON EP.major_id = T.[object_id]
                                                    WHERE (EP.class_desc IS NULL 
                                                        OR (EP.class_desc <> 'OBJECT_OR_COLUMN'
                                                        AND EP.[name] <> 'microsoft_database_tools_support'))    
                                            )
                                        `;

    private selectRelationshipsQuery = `SELECT  CONSTRAINT_NAME= CAST (PKnUKEY.name AS VARCHAR(30)) ,
                                                CONSTRAINT_TYPE=CAST (PKnUKEY.type_desc AS VARCHAR(30)) ,
                                                PARENT_TABLE_NAME=CAST (PKnUTable.name AS VARCHAR(30)) ,
                                                PARENT_COL_NAME=CAST ( PKnUKEYCol.name AS VARCHAR(30)) ,
                                                PARENT_COL_NAME_DATA_TYPE=  oParentColDtl.DATA_TYPE,        
                                                REFERENCE_TABLE_NAME='' ,
                                                REFERENCE_COL_NAME='' 

                                        FROM sys.key_constraints as PKnUKEY
                                            INNER JOIN (
				                                        SELECT T.object_id, T.name from sys.tables AS T
				                                        left join sys.extended_properties AS EP ON EP.major_id = T.[object_id]
				                                        WHERE (EP.class_desc IS NULL 
					                                        OR (EP.class_desc <> 'OBJECT_OR_COLUMN'
					                                        AND EP.[name] <> 'microsoft_database_tools_support'))  
			                                        ) as PKnUTable
				                                        ON PKnUTable.object_id = PKnUKEY.parent_object_id
	                                        INNER JOIN sys.index_columns as PKnUColIdx
                                                    ON PKnUColIdx.object_id = PKnUTable.object_id
                                                    AND PKnUColIdx.index_id = PKnUKEY.unique_index_id
                                            INNER JOIN sys.columns as PKnUKEYCol
                                                    ON PKnUKEYCol.object_id = PKnUTable.object_id
                                                    AND PKnUKEYCol.column_id = PKnUColIdx.column_id
                                             INNER JOIN INFORMATION_SCHEMA.COLUMNS oParentColDtl
                                                    ON oParentColDtl.TABLE_NAME=PKnUTable.name
                                                    AND oParentColDtl.COLUMN_NAME=PKnUKEYCol.name
                                        UNION ALL
                                        SELECT  CONSTRAINT_NAME= CAST (oConstraint.name AS VARCHAR(30)) ,
                                                CONSTRAINT_TYPE='FK',
                                                PARENT_TABLE_NAME=CAST (oParent.name AS VARCHAR(30)) ,
                                                PARENT_COL_NAME=CAST ( oParentCol.name AS VARCHAR(30)) ,
                                                PARENT_COL_NAME_DATA_TYPE= oParentColDtl.DATA_TYPE,     
                                                REFERENCE_TABLE_NAME=CAST ( oReference.name AS VARCHAR(30)) ,
                                                REFERENCE_COL_NAME=CAST (oReferenceCol.name AS VARCHAR(30)) 
                                        FROM sys.foreign_key_columns FKC
                                            INNER JOIN sys.sysobjects oConstraint
                                                    ON FKC.constraint_object_id=oConstraint.id 
                                            INNER JOIN sys.sysobjects oParent
                                                    ON FKC.parent_object_id=oParent.id
                                            INNER JOIN sys.all_columns oParentCol
                                                    ON FKC.parent_object_id=oParentCol.object_id /* ID of the object to which this column belongs.*/
                                                    AND FKC.parent_column_id=oParentCol.column_id/* ID of the column. Is unique within the object.Column IDs might not be sequential.*/
                                            INNER JOIN sys.sysobjects oReference
                                                    ON FKC.referenced_object_id=oReference.id
                                            INNER JOIN INFORMATION_SCHEMA.COLUMNS oParentColDtl
                                                    ON oParentColDtl.TABLE_NAME=oParent.name
                                                    AND oParentColDtl.COLUMN_NAME=oParentCol.name
                                            INNER JOIN sys.all_columns oReferenceCol
                                                    ON FKC.referenced_object_id=oReferenceCol.object_id /* ID of the object to which this column belongs.*/
                                                    AND FKC.referenced_column_id=oReferenceCol.column_id/* ID of the column. Is unique within the object.Column IDs might not be sequential.*/
                                        `;
}

export namespace MsSqlDatabaseRepository {

    class BaseConvertor {

        protected getDbType(value: string): DbType {

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


    export class RelationshipMetadataConvertor extends BaseConvertor {
        constructor(columns: Array<ColumnValue>) {
            super();
            this.columns = columns;
        }

        columns: Array<ColumnValue>;

        createRelationship(): Ralationship {

            const result = new Ralationship();

            let colValue = this.columns.filter(col => col.metadata.colName === "CONSTRAINT_NAME")[0];
            result.constrainName = colValue.value;

            colValue = this.columns.filter(col => col.metadata.colName === "CONSTRAINT_TYPE")[0];
            result.constraintType = this.getConstraintType(colValue.value);

            colValue = this.columns.filter(col => col.metadata.colName === "PARENT_TABLE_NAME")[0];
            result.parentTableName = colValue.value;

            colValue = this.columns.filter(col => col.metadata.colName === "PARENT_COL_NAME")[0];
            result.parentColumnName = colValue.value;

            colValue = this.columns.filter(col => col.metadata.colName === "PARENT_COL_NAME_DATA_TYPE")[0];
            result.parentColumnNameDataType = this.getDbType(colValue.value);

            colValue = this.columns.filter(col => col.metadata.colName === "REFERENCE_TABLE_NAME")[0];
            result.referenceTableName = colValue.value;

            colValue = this.columns.filter(col => col.metadata.colName === "REFERENCE_COL_NAME")[0];
            result.referenceColumnName = colValue.value;

            return result;


        }

        private getConstraintType(value: string): ConstraintType {
            switch (value) {
                case "FK":
                    return ConstraintType.FK;
                case "PRIMARY_KEY_CONSTRAINT":
                    return ConstraintType.PRIMARY_KEY_CONSTRAINT;
                case "UNIQUE_CONSTRAINT":
                    return ConstraintType.UNIQUE_CONSTRAINT;
                default:
                    throw new Error("The constraint type cannot be determined");
            }
        }
    }

    export class ColumnMetadataConvertor extends BaseConvertor {
        constructor(columns: Array<ColumnValue>) {
            super();
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
    }
}
