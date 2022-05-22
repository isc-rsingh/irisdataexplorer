from . import routes
import pandas as pd
import json
import iris

# ----------------------------------------------------------------
### DATAEXPLORER MANAGEMENT
# ----------------------------------------------------------------

# ----- DATAEXPLORER -----

# GET datasets
@routes.route("/api/explorer/explore/datasets", methods=["GET"])
def GetDatasets():
    try: 
        sqlquery = "SELECT TABLE_SCHEMA,TABLE_NAME,TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES"
        sqlquery += " WHERE TABLE_TYPE LIKE 'BASE TABLE'"
        rs = iris.sql.exec(sqlquery)
        datasetlist = []
        for row in rs:
            datasetlist.append(row[0]+'.'+row[1])
        datasets = {}
        datasets['datasets'] = datasetlist
        
        return datasets
    except Exception as ex:
        pass
    return 0

# GET properties from a given dataset
@routes.route("/api/explorer/explore/<string:dataset>/props", methods=["GET"])
def GetDatasetProperties(dataset: str):
    ###
    #     try {
    #     set sqlquery = "SELECT TOP 1 * FROM "_dataset
    #     set rs = ##class(%SQL.Statement).%ExecDirect(,sqlquery)
    #     set cols = rs.%GetMetadata().columns
    #     set idx = 1
    #     set props = ""
    #     write "{""properties"":[" 
    #     while idx<=rs.%ResultColumnCount {
    #         set props = props_"{"""_cols.GetAt(idx).colName_""": "
    #         set props = props_cols.GetAt(idx).clientType_"},"
    #         set idx = idx + 1
    #     }
    #     write $EXTRACT(props,1,*-1)
    #     write "]}"
    # } catch (oException) {
    #     write oException
    # }
    # Return $$$OK
    ###
    dataset= "Data.Titanic"
    sqlquery = "SELECT TOP 1 * FROM " + dataset
    try:
        rs = iris.sql.exec(sqlquery)
        cols = rs.ResultSet._GetMetadata().columns
        idx = 1
        props = {}
        props["properties"] = list()
        while idx <= len(cols):
            propName= cols.GetAt(idx).colName
            propType= cols.GetAt(idx).clientType
            idx=idx+1
            props["properties"].append({propName:propType})

        return props
    except Exception as e:
        raise e


# Get info for a prop
@routes.route("/api/explorer/explore/<string:dataset>/prop/<string:prop>/<int:type>", methods=["GET"])
def Explore(dataset,prop,type):
    if int(type) == 16: 
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
    if type == 10:
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
    
    return json.dumps(ret)
    

