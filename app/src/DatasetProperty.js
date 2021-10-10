import React from 'react'
import Grid from '@material-ui/core/Grid'
import { BarChart, Bar, XAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
const COLORS = ['#FFFFFF', '#38003D'];

class DatasetProperty extends React.Component {
    state = {
        dsprops: {}
    }

    componentDidMount() {
        let url = process.env.REACT_APP_IRISENDPOINT + "/explore/"
        url += this.props.dataset
        url += "/prop/" + this.props.name
        url += "/" + this.props.type
        console.log("fetching: "+url)
        fetch(url)
        .then( res => res.json() )
        .then( (propdata) => {
            this.setState( { dsprops: propdata })
        })
        .catch(console.log)
    }

    roundNum(num, sigdigits=1) {
      sigdigits = 10 ** sigdigits
      return Math.round(num * sigdigits) / sigdigits
    }

    renderUniquePie() {
      let notunique = this.state.dsprops.count-this.state.dsprops.freq
      let dat = [ {name: 'Count', value: notunique}, {name: 'Unique', value: this.state.dsprops.freq} ]
      return <PieChart width={50} height={50}>
        <Pie data={dat} dataKey="value" fill="#8884D8" stroke="#38003D">
          {dat.map((entry, idx) => 
            <Cell key={`cell-${idx}`} fill={COLORS[idx%COLORS.length]} />
          )}
        </Pie>
      </PieChart>
    }

    renderHistogram() {
      let chart
      if (this.state.dsprops.mean) 
        chart = <BarChart width={150} height={80} data={this.state.dsprops.bins}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222533" />
                  <XAxis dataKey="left" />
                  <Bar dataKey="value" fill="#38003D" />
                </BarChart>
      if (this.props.type === 16) 
        chart = <BarChart width={150} height={40} data={this.state.dsprops.tfcounts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222533" />
                  <Bar dataKey="count" fill="#38003D" />
                </BarChart>

      return chart
    }

    render() {
      let prop2, prop3, prop4, prop5, prophistogram, isNumeric, isBoolean, countTrue, countFalse
      isNumeric = isBoolean = false
      if ('mean' in this.state.dsprops) 
        isNumeric = true
      // @TODO do something interesting to visualize booleans differently than strings
      // if (this.state.dsprops.tfcounts && this.props.type === 16) {
      //   isBoolean = true
      //   let c = this.state.dsprops.tfcounts
      //   console.log(this.props.name)
      //   console.log(c)
      //   c.forEach(item => {
      //     if (item.value === 0) 
      //       countFalse = item.count
      //     else 
      //       countTrue = item.count          
      //   })
      // }
      if (this.state.dsprops.count === 0) {
        prop2 = prop3 = prop4 = prop5 = prophistogram = <div>-</div>
      }
      else if (isNumeric) {
        prop2 = 
        <Grid item xs={1}>
          <div className="code">
          <div className="codeheader">mean</div>
          <div className="code codeval">{this.roundNum(this.state.dsprops.mean, 3)}</div>
        </div>
        </Grid>
        prop3 = <Grid item xs={2}>
          <div className="code">
          <div className="codeheader">std</div>
          <div className="code codeval">{this.roundNum(this.state.dsprops.std, 3)}</div>
        </div></Grid>
        prop4 = <Grid item xs={1}>
          <div className="code">
          <div className="codeheader">min</div>
          <div className="code codeval">{this.roundNum(this.state.dsprops.min)}</div>
        </div></Grid>
        prop5 = <Grid item xs={1}>
          <div className="code">
          <div className="codeheader">max</div>
          <div className="code codeval">{this.roundNum(this.state.dsprops.max)}</div>
        </div></Grid>
        prophistogram = 
        <Grid item xs={3}>
          <div className="codeheader">histogram</div>
          {this.renderHistogram()}
        </Grid>
      }
      else {
        prop2 = 
        <Grid item xs={1}>
          <div className="code">
            <div className="codeheader">unique</div>
            <div className="codeval">{this.state.dsprops.unique}</div>
          </div>
        </Grid>
        prop3 = <Grid item xs={2}><div className="code">
          <div className="codeheader">top</div>
          <div className="codeval">{this.state.dsprops.top}</div>
      </div></Grid>
        prop4 = <Grid item xs={2}><div className="code">
          <div className="codeheader">frequency of {this.state.dsprops.top}</div>
          <div className="codeval">{this.roundNum(this.state.dsprops.freq)}</div>
        </div></Grid>
        prop5 = <Grid item xs={1}><div className="code">
          <div></div>
        </div></Grid>
        prophistogram = 
        <Grid item xs={2}>
          <div className="code">
            <div className="codeheader">{this.state.dsprops.top}</div>
            {this.renderUniquePie()}
          </div>
        </Grid>
      }

      return (
        <div className="datasetproperty">
          <Grid container>
            <Grid item xs={2}>
              <div className="codeheader">property</div>
              <div className="code codeval dataprop">{this.props.name}</div>
            </Grid>
            <Grid item xs={1}>
              <div className="codeheader">count</div>
              <div className="code codeval">{this.state.dsprops.count}</div>
            </Grid>
            {prop2}
            {prop3}
            {prop4}
            {prop5}
            {prophistogram}
          </Grid>
        </div>
      )
    }
}

export default DatasetProperty