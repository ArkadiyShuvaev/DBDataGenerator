import {ColumnMetadata} from "./ColumnMetadata";
import {Ralationship} from "./Ralationship";

export class DatabaseMetadata {
    constructor() {
        this.informations = [];
        this.relationships = [];
    }

    relationships: Array<Ralationship>;
    informations: Array<ColumnMetadata>;
}
