import {ConfigManager} from "./ConfigManager";
import { DataBaseService } from "./DataBaseService";
import {MsSqlDatabaseRepository as DatabaseRepository} from "./MsSqlDatabaseRepository";
import {DataGenerator} from "./DataGenerator";
import { IDataGenerator } from "./Abstractions/IDataGenerator";
const configPath = "../app.config.json";
const configManager = new ConfigManager(configPath);

const config = configManager.getConfig();
console.log(config);
const dbRepo = new DatabaseRepository(config);
const dataGenerator: IDataGenerator = new DataGenerator();
const service = new DataBaseService(dbRepo, dataGenerator, config);
service.fillOutSync();
