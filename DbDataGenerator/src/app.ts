import {ConfigManager} from "./ConfigManager";
import { DataBaseFiller } from "./DataBaseFiller";
import {DatabaseRepository} from "./DatabaseRepository";
const configPath = "../app.config.json";
const configManager = new ConfigManager(configPath);

var config = configManager.getConfig();
console.log(config);
var dbRepo = new DatabaseRepository(config);

var dbFiller = new DataBaseFiller(dbRepo);
