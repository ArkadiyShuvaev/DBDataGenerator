import {IAppConfig} from "../Abstractions/IAppConfig";
import { IDbRepository } from "../Abstractions/IDbRepository";
import { ColumnInformations } from "../ColumnInformation/ColumnInformations";
import { Connection, Request, TYPES, ColumnValue } from "tedious";
import { ILogger } from "../Logger/ILogger";
import { Promise, Thenable } from "es6-promise";
import {ColumnInformationConvertor} from "./ColumnInformationConvertor";

export class MsSqlDatabaseRepository implements IDbRepository {

    constructor(config: IAppConfig, logger: ILogger) {
        this.logger = logger;
        this.config = config;
    }

    getColumnMetadata(dbName: string): Thenable<ColumnInformations> {

        return new Promise((resolve, reject) => {
            this.getTableMetadataImpl(dbName, resolve, reject);
        });
    }
    
    getTableMetadataImpl(dbName: string,
        resolve: (value?: Object | PromiseLike<Object>) => void, reject: (reason?: any) => void): any {

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

        connection.on("debug", (debugMsg: string) => {
            this.logger.debug(debugMsg);
        });

        connection.on("connect",
            (err: Error) => {
                if (err == null) {
                    connection.execSql(request);
                } else {
                    this.logger.error(err.toString());
                    throw new Error(err.toString());
                }
            });
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

    getUserTables(dbName: string): Thenable<Array<string>> {

        return new Promise((resolve, reject) => {

            const userTables: Array<string> = [];

            const connection = this.createConnection(dbName);

            const request =
                new Request(`SELECT S.name as Owner, T.name as TableName FROM sys.tables AS T
                             INNER JOIN sys.schemas AS S ON S.schema_id = T.schema_id
                             LEFT JOIN sys.extended_properties AS EP ON EP.major_id = T.[object_id]
                             WHERE (EP.class_desc IS NULL 
                                OR (EP.class_desc <> 'OBJECT_OR_COLUMN'
                                AND EP.[name] <> 'microsoft_database_tools_support'))`,

                    (error: Error) => {

                        connection.close();

                        if (error) {
                            reject(error);
                        }

                        resolve(userTables);
                    }
                );

            this.executeRequest(connection, request, (columns: Array<ColumnValue>) => {
                userTables.push(columns.filter(col => col.metadata.colName === "TableName")[0].value);
            });

        });


    }
}