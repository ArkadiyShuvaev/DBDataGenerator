export interface IBaseGenerationSettings {
    /**
     * Full path to the resource data list.
     * Every new value should be located in the new string.
     */
    sourceResourceDataListFullPath: string;
    isNullValuesAllowed: boolean;
}

export interface ICharacterGenerationSettings extends IBaseGenerationSettings {
    /**
     * Regular expression for the generated string.
     */
    regularExpression: string;
    /**
     * defines the string length. The maximum storage size (2^31-1 bytes) indicates the MAX value
     */
    size: number;
}

export interface IIntGenerationSettings extends IBaseGenerationSettings {
    /**
     * The minimum value of the generated data range. For example, the minimum value for the Int32 type is -2147483648.
     */
    minimalValue: number;

    /**
     * The minimum value of the generated data range. For example, the maximum value for the Int32 type is 2147483647.
     */
    maximumValue: number;
}


export class BaseGenerationSettings implements IBaseGenerationSettings {
    constructor(isNullValuesAllowed: boolean, sourceResourceDataListFullPath?: string) {
        this.isNullValuesAllowed = isNullValuesAllowed;
        this.sourceResourceDataListFullPath = sourceResourceDataListFullPath || "";
    }

    readonly isNullValuesAllowed: boolean;
    readonly sourceResourceDataListFullPath: string;
}

export class CharacterGenerationSettings extends BaseGenerationSettings implements ICharacterGenerationSettings  {
    constructor(isNullValuesAllowed: boolean, size: number, sourceResourceDataListFullPath?: string) {
        super(isNullValuesAllowed, sourceResourceDataListFullPath);
        this.size = size;
    }

    regularExpression: string;
    size: number;
}

export class IntGenerationSettings extends BaseGenerationSettings implements IIntGenerationSettings {
    constructor(isNullValuesAllowed: boolean, sourceResourceDataListFullPath?: string) {
        super(isNullValuesAllowed, sourceResourceDataListFullPath);
    }
    
    maximumValue = 2147483647;
    minimalValue = -2147483648;
}

