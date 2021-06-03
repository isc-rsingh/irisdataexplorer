import React from 'react'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import DatasetProperty from './DatasetProperty'

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

  renderDataset() {
    return (
      this.state.datasetprops.map( (dsp) =>
        <DatasetProperty name={dsp} dataset={this.state} />
      )
    )
  }

  loadDataset(ds) {
    fetch("http://localhost:52775/csp/explorer/explore/"+ds+"/props")
      .then(res => res.json() )
      .then( (data) => {
        this.setState({ dataset: ds, datasetprops: data.properties})
      })
      .catch(console.log)
  }
  
  renderDatasets() {
    return (
      this.state.datasets.map( (ds) =>
        <div>
        <Card variant="outlined" id={ds} onClick={()=>this.loadDataset(ds)}>{ds}</Card>
        </div>
      )
    )
  }
  
  render() {
    let lefthead = null
    let leftbody = null
    if (this.state.dataset) {
      lefthead = <span>{this.state.dataset}</span>
      leftbody = this.renderDataset()
    } else {
      lefthead = <span>Data sets</span>
      leftbody = this.renderDatasets()
    }

    return (
      <Grid container>
        <Container maxWidth="lg">
        <Grid item xs={12}>
                <Typography variant="h3" gutterBottom>{lefthead}</Typography>
                <Paper>{leftbody}</Paper>
        </Grid>
        </Container>
      </Grid>
    )
  }
}

export default App
