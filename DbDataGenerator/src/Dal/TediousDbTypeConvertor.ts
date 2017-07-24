import {DbType} from "../ColumnInformation/DbType";
import {TediousType, TYPES} from "tedious";

export class TediousDbTypeConvertor {

    static convertToTediousSqlType(dbType: DbType): TediousType {
        switch (dbType) {

            case DbType.NChar:
                return TYPES.NChar;
                
            case DbType.NVarChar:
            return TYPES.NVarChar;

            case DbType.Int:
                return TYPES.Int;

            case DbType.Image:
                return TYPES.Image;

            case DbType.BigInt:
                return TYPES.BigInt;

            case DbType.SmallInt:
                return TYPES.SmallInt;

            case DbType.TinyInt:
                return TYPES.TinyInt;

            case DbType.Binary:
                return TYPES.Binary;

            case DbType.Bit:
                return TYPES.Bit;

            case DbType.Char:
                return TYPES.Char;

            case DbType.Date:
                return TYPES.Date;

            case DbType.DateTime:
                return TYPES.DateTime;

            case DbType.DateTime2:
                return TYPES.DateTime2;

            case DbType.DateTimeOffset:
                return TYPES.DateTimeOffset;

            case DbType.Decimal:
                return TYPES.Decimal;

            case DbType.SmallDateTime:
                return TYPES.SmallDateTime;

            case DbType.Float:
                return TYPES.Float;

            case DbType.UniqueIdentifier:
                return TYPES.UniqueIdentifier;

            case DbType.Money:
                return TYPES.Money;

            case DbType.SmallMoney:
                return TYPES.SmallMoney;

            case DbType.Xml:
                return TYPES.Xml;

            case DbType.NText:
                return TYPES.NText;

            case DbType.Real:
                return TYPES.Real;

            case DbType.VarChar:
                return TYPES.VarChar;

            case DbType.VarBinary:
                return TYPES.VarBinary;

            case DbType.Text:
                return TYPES.Text;

            case DbType.Udt:
                return TYPES.UDT;

            case DbType.Time:
                return TYPES.Time;

            case DbType.Structured:
                throw new TypeError("The type cannot be converted.");

            case DbType.Variant:
                throw new TypeError("The type cannot be converted.");

            case DbType.Timestamp:                
                throw new TypeError("The type cannot be converted.");

        default:
            throw new TypeError("The type cannot be converted.");
        }
    }


}