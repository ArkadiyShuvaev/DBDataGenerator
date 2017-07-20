/* CAST IS DONE , SO THAT OUTPUT INTEXT FILE REMAINS WITH SCREEN LIMIT*/
WITH   ALL_KEYS_IN_TABLE (CONSTRAINT_NAME,CONSTRAINT_TYPE,PARENT_TABLE_NAME,PARENT_COL_NAME,PARENT_COL_NAME_DATA_TYPE,REFERENCE_TABLE_NAME,REFERENCE_COL_NAME) 
AS
(
SELECT  CONSTRAINT_NAME= CAST (PKnUKEY.name AS VARCHAR(30)) ,
        CONSTRAINT_TYPE=CAST (PKnUKEY.type_desc AS VARCHAR(30)) ,
        PARENT_TABLE_NAME=CAST (PKnUTable.name AS VARCHAR(30)) ,
        PARENT_COL_NAME=CAST ( PKnUKEYCol.name AS VARCHAR(30)) ,
        PARENT_COL_NAME_DATA_TYPE=  oParentColDtl.DATA_TYPE,        
        REFERENCE_TABLE_NAME='' ,
        REFERENCE_COL_NAME='' 

FROM sys.key_constraints as PKnUKEY
    INNER JOIN sys.tables as PKnUTable
            ON PKnUTable.object_id = PKnUKEY.parent_object_id
    INNER JOIN sys.index_columns as PKnUColIdx
            ON PKnUColIdx.object_id = PKnUTable.object_id
            AND PKnUColIdx.index_id = PKnUKEY.unique_index_id
    INNER JOIN sys.columns as PKnUKEYCol
            ON PKnUKEYCol.object_id = PKnUTable.object_id
            AND PKnUKEYCol.column_id = PKnUColIdx.column_id
     INNER JOIN INFORMATION_SCHEMA.COLUMNS oParentColDtl
            ON oParentColDtl.TABLE_NAME=PKnUTable.name
            AND oParentColDtl.COLUMN_NAME=PKnUKEYCol.name
UNION ALL
SELECT  CONSTRAINT_NAME= CAST (oConstraint.name AS VARCHAR(30)) ,
        CONSTRAINT_TYPE='FK',
        PARENT_TABLE_NAME=CAST (oParent.name AS VARCHAR(30)) ,
        PARENT_COL_NAME=CAST ( oParentCol.name AS VARCHAR(30)) ,
        PARENT_COL_NAME_DATA_TYPE= oParentColDtl.DATA_TYPE,     
        REFERENCE_TABLE_NAME=CAST ( oReference.name AS VARCHAR(30)) ,
        REFERENCE_COL_NAME=CAST (oReferenceCol.name AS VARCHAR(30)) 
FROM sys.foreign_key_columns FKC
    INNER JOIN sys.sysobjects oConstraint
            ON FKC.constraint_object_id=oConstraint.id 
    INNER JOIN sys.sysobjects oParent
            ON FKC.parent_object_id=oParent.id
    INNER JOIN sys.all_columns oParentCol
            ON FKC.parent_object_id=oParentCol.object_id /* ID of the object to which this column belongs.*/
            AND FKC.parent_column_id=oParentCol.column_id/* ID of the column. Is unique within the object.Column IDs might not be sequential.*/
    INNER JOIN sys.sysobjects oReference
            ON FKC.referenced_object_id=oReference.id
    INNER JOIN INFORMATION_SCHEMA.COLUMNS oParentColDtl
            ON oParentColDtl.TABLE_NAME=oParent.name
            AND oParentColDtl.COLUMN_NAME=oParentCol.name
    INNER JOIN sys.all_columns oReferenceCol
            ON FKC.referenced_object_id=oReferenceCol.object_id /* ID of the object to which this column belongs.*/
            AND FKC.referenced_column_id=oReferenceCol.column_id/* ID of the column. Is unique within the object.Column IDs might not be sequential.*/

)

select * from   ALL_KEYS_IN_TABLE
where   
    PARENT_TABLE_NAME  in ('Table_2') 
    or REFERENCE_TABLE_NAME  in ('Table_1')
ORDER BY PARENT_TABLE_NAME,CONSTRAINT_NAME;
