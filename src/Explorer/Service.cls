/// IRIS data explorer data generator API
/// Property type codes are as follows
/// see: https://docs.intersystems.com/irislatest/csp/documatic/%25CSP.Documatic.cls?&LIBRARY=%25SYS&CLASSNAME=%25SQL.StatementColumn#PROPERTY_clientType
/// 1		BINARY
/// 2		DATE
/// 3		DOUBLE
/// 4		HANDLE
/// 5		INTEGER
/// 6		LIST
/// 7		LONGVARCHAR
/// 8		TIME
/// 9		TIMESTAMP
/// 10		VARCHAR
/// 11		STATUS
/// 12		BINARYSTREAM
/// 13		CHARACTERSTREAM
/// 14		NUMERIC
/// 15		CURRENCY
/// 16		BOOLEAN
/// 17		OID
/// 18		BIGINT
/// 19		FDATE
/// 20		FTIMESTAMP
Class Explorer.Service Extends %CSP.REST
{

Parameter HandleCorsRequest = 1;

Parameter CONTENTTYPE = "application/json";

/// Description 
ClassMethod ExploreP(dataset As %String, prop As %String, proptype As %Integer) As %String [ Language = python ]
{
    import iris
    import pandas as pd
    import json

    # boolean data type
    if int(proptype) == 16: 
        rs = iris.sql.exec('SELECT "' + prop + '" as val, count("'+prop+'") as cnt FROM ' + dataset + ' GROUP BY "' + prop + '"')
        ret = {}
        tfcounts = [] 
        cnt = 0
        for idx, row in enumerate(rs):
            tfcounts.insert(0, {"value": row[0], "count": row[1]})
            cnt += row[1]
        ret["tfcounts"] = tfcounts
        ret["count"] = cnt
        return json.dumps(ret)
 
    # if we're here we know it's not a boolean
    rs = iris.sql.exec('SELECT "' + prop + '" FROM ' + dataset)
    df = rs.dataframe()
    b = df[prop.lower()].describe()
 
    # no data case
    if (b["count"] == 0):
        ret = { "count": 0 }

    ret = json.loads(b.to_json())
    # @TODO handle strings better
    if int(proptype) == 10:
        return json.dumps(ret)

    # this is good for numeric values
    elif ("min" in b):
        c = df[prop.lower()].value_counts(bins=10, sort=False)
        clist = []
        for iv in c.iteritems(): 
            d = {}
            ivlr = str(iv[0].left) + " - " + str(iv[0].right)
            d['value'] = iv[1]
            d['left'] = str(iv[0].left)
            d['right'] = str(iv[0].right)
            clist.append(d)
        ret["bins"] = clist
        return json.dumps(ret)
}

/// Description
ClassMethod Explore(dataset As %String, prop As %String = "", proptype As %Integer) As %Status
{
    set a = 3
    write ..ExploreP(dataset, prop, proptype)
    Return $$$OK
}

ClassMethod GetDatasetProperties(dataset As %String = "Data.Crimes2021") As %Status
{
    try {
        set sqlquery = "SELECT TOP 1 * FROM "_dataset
        set rs = ##class(%SQL.Statement).%ExecDirect(,sqlquery)
        set cols = rs.%GetMetadata().columns
        set idx = 1
        set props = ""
        write "{""properties"":[" 
        while idx<=rs.%ResultColumnCount {
            set props = props_"{"""_cols.GetAt(idx).colName_""": "
            set props = props_cols.GetAt(idx).clientType_"},"
            set idx = idx + 1
        }
        write $EXTRACT(props,1,*-1)
        write "]}"
    } catch (oException) {
        write oException
    }
    Return $$$OK
}

/// Returns all table names
ClassMethod GetDatasets() As %Status
{
    try {
        set sqlquery = "SELECT TABLE_SCHEMA,TABLE_NAME,TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES"
        set sqlquery = sqlquery_" WHERE TABLE_TYPE LIKE 'BASE TABLE'"
        set rs = ##class(%SQL.Statement).%ExecDirect(,sqlquery)
        set datasetlist = []
        while rs.%Next() {
            do datasetlist.%Push( (rs."TABLE_SCHEMA"_"."_rs."TABLE_NAME"), "string")
        }
        set datasets = {}
        set datasets."datasets" = datasetlist
        write datasets.%ToJSON()
    } catch (oException) {
        write oException
    }
    Return $$$OK
}

/// Returns all table names
ClassMethod GetDatasetsPython() As %Integer [ Language = python ]
{
    import iris
    try: 
        sqlquery = "SELECT TABLE_SCHEMA,TABLE_NAME,TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES"
        sqlquery += " WHERE TABLE_TYPE LIKE 'BASE TABLE'"
        rs = iris.sql.exec(sqlquery)
        datasetlist = []
        for row in rs:
            datasetlist.append(row[0]+'.'+row[1])
            #; print(row)
        datasets = {}
        datasets['datasets'] = datasetlist
        print(datasets)
        return
    except Exception as ex:
        #; print(ex)
        pass
    return 0
}

XData UrlMap [ XMLNamespace = "http://www.intersystems.com/urlmap" ]
{
<Routes>
    <Route Url="/explore/datasets" Method="GET" Call="GetDatasets" />
    <Route Url="/explore/:dataset/props" Method="GET" Call="GetDatasetProperties" />
    <Route Url="/explore/:dataset/prop/:prop/:type" Method="GET" Call="Explore" />
</Routes>
}

}
