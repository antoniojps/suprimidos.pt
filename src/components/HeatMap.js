import React, { Component } from 'react'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import styled from 'styled-components'

export default class HeatMap extends Component {

    getDaysArr(data) {
        let dataKeys = Object.keys(data[0])
        const lineIndex = dataKeys.indexOf('line')
        dataKeys.splice(lineIndex, 1)
        return dataKeys
    }

    render() {
        const { data } = this.props
        const keys = this.getDaysArr(data)
        return (
            <Wrapper>
                <ResponsiveHeatMap
                    data={data}
                    keys={keys}
                    indexBy="line"
                    margin={{
                        "top": 70,
                        "right": 60,
                        "bottom": 60,
                        "left": 100
                    }}
                    colors="blues"
                    axisTop={{
                        "orient": "top",
                        "tickSize": 5,
                        "tickPadding": 5,
                        "tickRotation": 0,
                        "legend": "Dia",
                        "legendPosition": "middle",
                        "legendOffset": -40
                    }}
                    axisLeft={{
                        "orient": "left",
                        "tickSize": 5,
                        "tickPadding": 5,
                        "tickRotation": 0,
                        "legend": "Linha",
                        "legendPosition": "middle",
                        "legendOffset": -90
                    }}
                    cellOpacity={1}
                    cellBorderColor="inherit:darker(0.4)"
                    labelTextColor="inherit:darker(1.8)"
                    animate={false}
                    motionStiffness={0}
                    motionDamping={0}
                    hoverTarget="row"
                    cellHoverOthersOpacity={0.25}
                />
            </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  width: 100%;
  height: 500px;
`;
