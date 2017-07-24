import {ConfigManager} from "./ConfigManager";
import { DataService as DataBaseService } from "./DataService";
import {MsSqlDatabaseRepository as DatabaseRepository} from "./Dal/MsSqlDatabaseRepository";
import {DataGenerator} from "./DataGenerator";
import { IDataGenerator } from "./Abstractions/IDataGenerator";
import {Logger} from "./Logger/Logger";
const configPath = "../app.config.json";
const configManager = new ConfigManager(configPath);

const config = configManager.getConfig();
console.log(config);
const dbRepo = new DatabaseRepository(config, new Logger());
const dataGenerator: IDataGenerator = new DataGenerator();
const service = new DataBaseService(dbRepo, dataGenerator, config, new Logger());
service.populate();
