import {IAppConfig} from "./Abstractions/IAppConfig";
import { IDbRepository } from "./Abstractions/IDbRepository";
import {ColumnInformations} from "./ColumnInformations";
import { ColumnInformation } from "./ColumnInformation";
import { Connection, Request } from "tedious";

export class MsSqlDatabaseRepository implements IDbRepository {
    getTableMetadata(name: string): ColumnInformations {
        const columnInfos = new ColumnInformations();
        const config = {
            userName: this.config.connectionSettings.userName,
            password: this.config.connectionSettings.password,
            server: this.config.connectionSettings.server
        };
        const connection = new Connection(config);

        connection.on('connect',
            (err: string) => {
                // If no error, then good to go...
                const request = new Request("select * from[DataGeneratorApp].[dbo].[Table_1]", (err2: Error, rowCount: number, rows: any[]) => {
                        if (err2) {
                            console.log(err2);
                        } else {
                            console.log(rowCount + ' rows');
                        }

                        connection.close();
                    }
                );

                request.on('row', function (columns: any) {
                    columns.forEach(function (column: any) {
                        if (column.value === null) {
                            console.log('NULL');
                        } else {
                            console.log(column.value);
                        }
                    });
                });

                request.on('done', function (rowCount: any, more: any) {
                    console.log(rowCount + ' rows returned');
                });

                connection.execSql(request);

            });


        connection.on("debug", (err: string) => {
            console.log('debug:', err);
        });

        

        const request2 = new Request("select * from [DataGeneratorApp].[dbo].[Table_1]",
            (error: Error, rowCount: number, rows: any[]) => {
                var rs = rows;
            });

        

        return columnInfos;
    }

    private readonly config: IAppConfig;

    constructor(config: IAppConfig) {
        this.config = config;
    }

    save(): boolean {
        return true;
    }
}