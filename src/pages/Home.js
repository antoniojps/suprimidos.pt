import React, { Component } from 'react'
import { Container, Row, Col, Card, Table, Jumbotron } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import CountUp from 'react-countup';
import moment from 'moment'
import 'moment-timezone'
import 'moment/locale/pt'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as suppressedActions from '../actions/suppressedActions'
import Loc from '../locations.json'
import { allSuppressedContentToHeatMapData } from './../utils/filter'
import HeatMap from './../components/HeatMap'

class Home extends Component {

  constructor(props) {
    super(props)
    this.state = {
      totalSuppressed: 0,
      fetchedAll: false,
    }
  }

  async componentWillMount() {
    const { locations } = Loc
    // API Calls
    this.setState({
      fetchedAll: false,
    })
    await this.props.actions.getLastSuppressed()
    await Promise.all(
      locations.map(async ({ key }) => {
        await this.props.actions.getLastSuppressedByLocation(key)
        await this.props.actions.getLastWeeksSuppressedByLocation(key)
      })
    )
    this.setState({
      fetchedAll: true,
    })
  }

  componentDidUpdate() {
    let total = 0
    let missing = false
    for (let location of Loc.locations) {

      let data = this.props.allSuppressedContent[`fetchedLastWeeksSuppressedIn${location.key}`]

      if(typeof data === 'undefined'){
        missing = true
      } else {
        for(let i in data){
          total += data[i].count
        }
      }
    }

    if( !missing && !this.state.totalSuppressed){
       this.setState({...this.state, totalSuppressed: total})
    }
  }

  handleTimeToAnimate() {
    let lastSupression
    let numberValue = false
    let prefixString = 'há muito'
    let SufixString = 'tempo'
    if (this.props.allSuppressedContent.fetchedLastSuppressed) {
      lastSupression = moment.unix(this.props.allSuppressedContent.fetchedLastSuppressed.timestamp).fromNow()
      let prefixExp = /^\D*/
      let sufixExp = /\w*$/
      let numberValueExp = /\d+/g
      if (lastSupression.match(prefixExp)[0]) {
        prefixString = lastSupression.match(prefixExp)[0]
      }
      if (lastSupression.match(sufixExp)[0]) {
        SufixString = lastSupression.match(sufixExp)[0]
      }
      if (lastSupression.match(numberValueExp) && lastSupression.match(numberValueExp)[0]) {
        numberValue = parseInt(lastSupression.match(numberValueExp)[0])
      }
      // If the first string has the substring we just render the prefix
      if (prefixString.includes(SufixString)) {
        SufixString = ''
      }
      // console.log('SufixString', SufixString)
      // console.log('prefixString', prefixString)
      // console.log('numberValue', numberValue)
    }

    return { numberValue, prefixString, SufixString: ` ${SufixString}` }
  }

  handleLines() {
    let allLines = []
    for (let location of Loc.locations) {
      if (this.props.allSuppressedContent[`fetchedLastSuppressedIn${location.key}`]) {
        allLines = [...allLines, this.renderLine(location, this.props.allSuppressedContent[`fetchedLastSuppressedIn${location.key}`])]
      }
    }
    return allLines
  }

  renderLine(location, content) {
    return (
      <tr key={location.key}>
        <td><Link to={`/suprimidos/${location.key}`}><i className="fas fa-train"></i> {location.value}</Link></td>
        <td>{moment.unix(content.timestamp).fromNow()}</td>
        <td>{content.type}</td>
        <td>{content.vendor}</td>
        <td><Link to={`/suprimidos/${location.key}`}><i className="fas fa-link"></i></Link></td>
      </tr>
    )
  }

  renderHeatMap() {
    if (!this.state.fetchedAll) return;
    const { locations } = Loc
    const allSuppressedContent = locations.map(location => {
      const week = this.props.allSuppressedContent[`fetchedLastWeeksSuppressedIn${location.key}`]
      return {
        week,
        line: location.value
       }
    })

    const data = allSuppressedContentToHeatMapData(allSuppressedContent)
    return (<HeatMap data={data}/>)

  }


  renderCount(count) {
    if (count) {
      let randomStart = Math.floor(Math.random() * (20 - 1 + 1)) + 1;

      return <CountUp
        start={randomStart}
        end={parseInt(count, 10)}
        duration={4}
        delay={1}
      />
    } else {
      return <i className="fas fa-check-circle"></i>
    }
  }

  render() {
    moment.locale('pt')
    let { numberValue, prefixString, SufixString } = this.handleTimeToAnimate()
    return (
      <div className="Home">
        <Jumbotron fluid>
          <Container>
            <h1 className="text-center">O último comboio suprimido foi {prefixString}
              {numberValue && <CountUp
                start={0}
                end={numberValue}
                duration={3}
                delay={0.5}
              />}
              {SufixString}
            </h1>
          </Container>
        </Jumbotron>
        <Container>
          <Row>
            <Col xs={12}>
              <Card>
                <Card.Body className="text-center">
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Linha</th>
                        <th>Último Suprimido</th>
                        <th>Tipo</th>
                        <th>Operador</th>
                        <th>Ver todos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.handleLines()}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        <Jumbotron fluid className="mt-5">
          <Container>
          <h2 className="text-center">Total de comboios suprimidos nos últimos dias: {this.state.totalSuppressed}</h2>
          </Container>
        </Jumbotron>
        <Container>
          <Row>
            {this.renderHeatMap()}
          </Row>
        </Container>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...suppressedActions }, dispatch)
  }
}

function mapStateToProps(state) {
  return {
    allSuppressedContent: state.suppressedReducer,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
