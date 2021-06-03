/// Description
Class Explorer.Service Extends %CSP.REST
{

Parameter HandleCorsRequest = 1;

Parameter CONTENTTYPE = "application/json";

/// Description 
ClassMethod ExploreP(dataset As %String, prop As %String) As %String [ Language = python ]
{
    import iris
    import pandas as pd
    import json

    rs = iris.sql.exec("SELECT " + prop + " FROM " + dataset)
    df = rs.dataframe()
    b = df[prop.lower()].describe()
    ret = json.loads(b.to_json())

    if "min" in b:
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
ClassMethod Explore(dataset As %String, prop As %String = "") As %Status
{
    // do something
    write ..ExploreP(dataset, prop)
    Return $$$OK
}

/// Description
ClassMethod GetDatasetProperties(dataset As %String = "Data.Crimes2021") As %Status
{
    try {
        set sqlquery = "SELECT TOP 1 * FROM Data.Crimes2021"
        set rs = ##class(%SQL.Statement).%ExecDirect(,sqlquery)
        #; set colCount = rs.%ResultColumnCount
        set cols = rs.%GetMetadata().columns
        set idx = 1
        set props = ""
        write "{""properties"":["
        while idx<=rs.%ResultColumnCount {
            set props = props_""""_cols.GetAt(idx).colName_""","
            set idx = idx + 1
        }
        write $EXTRACT(props,1,*-1)
        write "]}"
    } catch (oException) {
        write oException
    }
    Return $$$OK
}

XData UrlMap [ XMLNamespace = "http://www.intersystems.com/urlmap" ]
{
<Routes>
    <Route Url="/explore/:dataset/props" Method="GET" Call="GetDatasetProperties" />
    <Route Url="/explore/:dataset/prop/:prop" Method="GET" Call="Explore" />
</Routes>
}

}
