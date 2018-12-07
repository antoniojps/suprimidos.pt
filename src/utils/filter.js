import moment from 'moment'

export function lastWeeksByLocationToHeatMapData({ week, line }) {

  const reducer = (accumulator, lineDay) => {
    const { year, month, day, count } = lineDay
    const date = `${year}-${month}-${day}`
    const formattedDate = moment(date).format("MMM Do")
    accumulator[formattedDate] = count
    return accumulator
  }

  let weekDataFormatted = week.reduce(reducer, {})
  return {
    line,
    ...weekDataFormatted
  }
}

export function allSuppressedContentToHeatMapData(allSuppressedContent) {
  const allSuppressedContentFormatted = allSuppressedContent.map(({line, week}) => {
    return lastWeeksByLocationToHeatMapData({week, line})
  })
  return allSuppressedContentFormatted
}