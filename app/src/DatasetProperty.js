import React from 'react'
import Grid from '@material-ui/core/Grid'
import { BarChart, Bar } from 'recharts'

const data = [
    {
      name: "Page A",
      uv: 4000,
      pv: 2400,
      amt: 2400
    },
    {
      name: "Page B",
      uv: 3000,
      pv: 1398,
      amt: 2210
    },
    {
      name: "Page C",
      uv: 2000,
      pv: 9800,
      amt: 2290
    },
    {
      name: "Page D",
      uv: 2780,
      pv: 3908,
      amt: 2000
    },
    {
      name: "Page E",
      uv: 1890,
      pv: 4800,
      amt: 2181
    },
    {
      name: "Page F",
      uv: 2390,
      pv: 3800,
      amt: 2500
    },
    {
      name: "Page G",
      uv: 3490,
      pv: 4300,
      amt: 2100
    }
  ]

class DatasetProperty extends React.Component {
    state = {
        dsprops: {}
    }

    componentDidMount() {
        let url = "http://localhost:52775/csp/explorer/explore/"
        url += this.props.dataset
        url += "/prop/" + this.props.name
        fetch(url)
        .then( res => res.json() )
        .then( (data) => {
            this.setState( { dsprops: data })
        })
        .catch(console.log)
    }

    renderChart() {
        return (
            <BarChart width={150} height={40} data={data}>
                <Bar dataKey="uv" fill="#8884d8" />
            </BarChart>      
        )
    }

    render() {
        return (
            <Grid container>
                <Grid item xs={3}>
                    <h4>{this.props.name}</h4>
                </Grid>
                <Grid item xs={2}>
                    <p>prop 1</p>
                </Grid>
                <Grid item xs={2}>
                <p>prop 2</p>
                </Grid>
                <Grid item xs={2}>
                <p>prop 3</p>
                </Grid>
                <Grid item xs={3}>{this.renderChart()}</Grid>
            </Grid>
        )
    }
}

export default DatasetProperty