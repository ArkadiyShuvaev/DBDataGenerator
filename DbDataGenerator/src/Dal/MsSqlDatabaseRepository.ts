import {IAppConfig} from "../Abstractions/IAppConfig";
import { IDbRepository } from "../Abstractions/IDbRepository";
import { ColumnInformations } from "../ColumnInformation/ColumnInformations";
import { Connection, Request, TYPES, ColumnValue } from "tedious";
import { ILogger } from "../Logger/ILogger";
import { Promise, Thenable } from "es6-promise";
import { ColumnInformationConvertor } from "./ColumnInformationConvertor";
import { RowColumnInformation } from "../ColumnInformation/RowColumnInformation";

export class MsSqlDatabaseRepository implements IDbRepository {

    constructor(config: IAppConfig, logger: ILogger) {
        this.logger = logger;
        this.config = config;
    }

    saveColumns(rows: Array<Array<RowColumnInformation>>, dbName: string, tableName: string): Thenable<number> {

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

            bulkLoad.addColumn("Str", TYPES.NChar, { length: 4000, nullable: true });

            for (let row of rows) {
                bulkLoad.addRow({ Str: row[0].value });
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
                    var c = connection.listeners("connect");

                    if (error) {
                        this.logger.error(error.toString());
                        reject(error);
                    }

                    resolve(columnInfos);
                }
        );
        
        this.executeRequest(connection, request, (columns: Array<ColumnValue>) => {
            const convertor = new ColumnInformationConvertor(columns);
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

        request.on('requestCompleted', function () {
            var a = 3;
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