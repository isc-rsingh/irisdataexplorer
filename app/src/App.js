import React from 'react'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import DatasetProperty from './DatasetProperty'
import { Divider } from '@material-ui/core'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      datasetprop: "",
      datasetprops: [],
      dataset: "",
      datasets: ["Data.Crimes2021", "Data.Crimes"]
    }
  }

  componentDidMount() {
    fetch("http://localhost:52773/api/explorer/explore/datasets")
      .then(res => res.json() )
      .then( (data) => {
        this.setState({ datasets: data.datasets})
      })
      .catch(console.log)
  }

  renderDataset() {
    return (
      this.state.datasetprops.map( (dsp) =>
        <DatasetProperty name={Object.keys(dsp)[0]} type={dsp[Object.keys(dsp)[0]]} dataset={this.state.dataset} />
      )
    )
  }

  loadDataset(ds) {
    fetch("http://localhost:52773/api/explorer/explore/"+ds+"/props")
      .then(res => res.json() )
      .then( (data) => {
        this.setState({ dataset: ds, datasetprops: data.properties})
      })
      .catch(console.log)
  }
  
  renderDatasets() {
    return (
      this.state.datasets.map( (ds) =>
        <Grid container>
          <Grid item xs={12}>
            <h3 id={ds} className="dataset" onClick={()=>this.loadDataset(ds)}>{ds}</h3>
            <Divider />
          </Grid>
        </Grid>
      )
    )
  }
  
  render() {
    let lefthead = null
    let leftbody = null
    if (this.state.dataset) {
      lefthead = <span>
        <span className="dsbreadcrumb">Data Sets / </span>
        <span>{this.state.dataset}</span>
      </span>
      leftbody = this.renderDataset()
    } else {
      lefthead = <span>Data sets</span>
      leftbody = this.renderDatasets()
    }

    return (
      <Grid container>
        <Container maxWidth="lg">
        <Grid item xs={12}>
                <h2>{lefthead}</h2>
                <div>{leftbody}</div>
        </Grid>
        </Container>
      </Grid>
    )
  }
}

export default App
