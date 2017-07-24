export enum DbType {
    /**
     * A 64-bit signed integer.
     */
    BigInt,

    /// <summary>
    ///   <see cref="T:System.Array" /> of type <see cref="T:System.Byte" />. A fixed-length stream of binary data ranging between 1 and 8,000 bytes.</summary>
    Binary,

    /// <summary>
    ///   <see cref="T:System.Boolean" />. An unsigned numeric value that can be 0, 1, or null. </summary>
    Bit,

    /// <summary>
    ///   <see cref="T:System.String" />. A fixed-length stream of non-Unicode characters ranging between 1 and 8,000 characters.</summary>
    Char,

    /// <summary>
    ///   <see cref="T:System.DateTime" />. Date and time data ranging in value from January 1, 1753 to December 31, 9999 to an accuracy of 3.33 milliseconds.</summary>
    DateTime,

    /// <summary>
    ///   <see cref="T:System.Decimal" />. A fixed precision and scale numeric value between -10 38 -1 and 10 38 -1.</summary>
    Decimal,

    /// <summary>
    ///   <see cref="T:System.Double" />. A floating point number within the range of -1.79E +308 through 1.79E +308.</summary>
    Float,

    /**
     * A variable-length stream of binary data ranging from 0 to 2 31 -1 (or 2,147,483,647) bytes.
     */
    Image,

    /**
     * A 32-bit signed integer.
     */
    Int,

    /// <summary>
    ///   <see cref="T:System.Decimal" />. A currency value ranging from -2 63 (or -9,223,372,036,854,775,808) to 2 63 -1 (or +9,223,372,036,854,775,807) with an accuracy to a ten-thousandth of a currency unit.</summary>
    Money,

    /// <summary>
    ///   <see cref="T:System.String" />. A fixed-length stream of Unicode characters ranging between 1 and 4,000 characters.</summary>
    NChar,

    /// <summary>
    ///   <see cref="T:System.String" />. A variable-length stream of Unicode data with a maximum length of 2 30 - 1 (or 1,073,741,823) characters.</summary>
    NText,

    /// <summary>
    ///   <see cref="T:System.String" />. A variable-length stream of Unicode characters ranging between 1 and 4,000 characters. Implicit conversion fails if the string is greater than 4,000 characters. Explicitly set the object when working with strings longer than 4,000 characters.</summary>
    NVarChar,

    /// <summary>
    ///   <see cref="T:System.Single" />. A floating point number within the range of -3.40E +38 through 3.40E +38.</summary>
    Real,

    /**
     * A globally unique identifier (or GUID).
     */
    UniqueIdentifier,

    /// <summary>
    ///   <see cref="T:System.DateTime" />. Date and time data ranging in value from January 1, 1900 to June 6, 2079 to an accuracy of one minute.</summary>
    SmallDateTime,

    /// <summary>
    ///   <see cref="T:System.Int16" />. A 16-bit signed integer.</summary>
    SmallInt,

    /// <summary>
    ///   <see cref="T:System.Decimal" />. A currency value ranging from -214,748.3648 to +214,748.3647 with an accuracy to a ten-thousandth of a currency unit.</summary>
    SmallMoney,

    /// <summary>
    ///   <see cref="T:System.String" />. A variable-length stream of non-Unicode data with a maximum length of 2 31 -1 (or 2,147,483,647) characters.</summary>
    Text,

    /// <summary>
    ///   <see cref="T:System.Array" /> of type <see cref="T:System.Byte" />. Automatically generated binary numbers, which are guaranteed to be unique within a database. timestamp is used typically as a mechanism for version-stamping table rows. The storage size is 8 bytes.</summary>
    Timestamp,

    /// <summary>
    ///   <see cref="T:System.Byte" />. An 8-bit unsigned integer.</summary>
    TinyInt,

    /// <summary>
    ///   <see cref="T:System.Array" /> of type <see cref="T:System.Byte" />. A variable-length stream of binary data ranging between 1 and 8,000 bytes. Implicit conversion fails if the byte array is greater than 8,000 bytes. Explicitly set the object when working with byte arrays larger than 8,000 bytes.</summary>
    VarBinary,

    /// <summary>
    ///   <see cref="T:System.String" />. A variable-length stream of non-Unicode characters ranging between 1 and 8,000 characters.</summary>
    VarChar,

    /// <summary>
    ///   <see cref="T:System.Object" />. A special data type that can contain numeric, string, binary, or date data as well as the SQL Server values Empty and Null, which is assumed if no other type is declared.</summary>
    Variant,

    /// <summary>An XML value. Obtain the XML as a string using the <see cref="M:System.Data.SqlClient.SqlDataReader.GetValue(System.Int32)" /> method or <see cref="P:System.Data.SqlTypes.SqlXml.Value" /> property, or as an <see cref="T:System.Xml.XmlReader" /> by calling the <see cref="M:System.Data.SqlTypes.SqlXml.CreateReader" /> method.</summary>
    Xml,

    /// <summary>A SQL Server 2005 user-defined type (UDT).</summary>
    Udt,

    /// <summary>A special data type for specifying structured data contained in table-valued parameters.</summary>
    Structured,

    /// <summary>Date data ranging in value from January 1,1 AD through December 31, 9999 AD.</summary>
    Date,

    /// <summary>Time data based on a 24-hour clock. Time value range is 00:00:00 through 23:59:59.9999999 with an accuracy of 100 nanoseconds. Corresponds to a SQL Server time value.</summary>
    Time,

    /// <summary>Date and time data. Date value range is from January 1,1 AD through December 31, 9999 AD. Time value range is 00:00:00 through 23:59:59.9999999 with an accuracy of 100 nanoseconds.</summary>
    DateTime2,

    /**
     * Date and time data with time zone awareness.
     * Date value range is from January 1,1 AD through December 31, 9999 AD.
     * Time value range is 00:00:00 through 23:59:59.9999999 with an accuracy of 100 nanoseconds.
     * Time zone value range is -14:00 through +14:00.
     */
    DateTimeOffset
}