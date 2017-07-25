import {ConfigManager} from "./ConfigManager";
import { DataService } from "./DataServices/DataService";
import {MsSqlDatabaseRepository as DatabaseRepository} from "./Dal/MsSqlDatabaseRepository";
import { DataGenerator } from "./DataServices/DataGenerator";
import { IDataGenerator } from "./Abstractions/IDataGenerator";
import {Logger} from "./Logger/Logger";
const configPath = "../app.config.json";
const configManager = new ConfigManager(configPath);

const config = configManager.getConfig();
const dbRepo = new DatabaseRepository(config, new Logger());
const dataGenerator: IDataGenerator = new DataGenerator();
const dataService = new DataService(dbRepo, dataGenerator, config, new Logger());
dataService.populate();
