var API_KEY = '34BD7WDY2GHG9T005HH70BW9U'

async function lookup_weather() {
  let location = document.getElementById("location").value
  let start_year = document.getElementById("start_year").value
  let end_year = document.getElementById("end_year").value
  let month = document.getElementById("month").value
  let units = document.getElementById("units").value

  // build url
  let baseUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/'
  //let queryDate = '&startDateTime=' + start_year + '-01-01T00:00:00&endDateTime=' + end_year + '-12-31T23:59:59'
  let queryDate = '&minYear=' + start_year + '&maxYear=' + end_year + '&chronoUnit=years&breakBy=years&dailySummaries=false'
  let queryTypeParams = 'historysummary?&aggregateHours=24&unitGroup=us' + queryDate
  let queryLocation = '&location=' + encodeURIComponent(location) + '&locationMode=single'
  let queryKey = '&key=' + API_KEY
  let queryContentType = '&contentType=json'
  let url = baseUrl + queryTypeParams + queryLocation + queryKey + queryContentType

  console.log("fetching url: "+url)

  // fetch data
  response = await fetch(url)
  json = await response.json()
  console.log(json)

  let chart_data = []

  // translate to graph format
  // - grab the parameter from each row
  // - put them in a series
  json.location.values.forEach((row) => {
    chart_data.push({
      x: row.period.split(" ")[0],
      y: row.temp
    })
  })

  console.log(chart_data)

  // init graph
  initializeChart(chart_data)

  console.log("chart is ready")
}

function initializeChart(data) {
  new Chart(document.getElementById("chart"), {
    type: 'scatter',
    data: {
      //labels: labels,
      datasets: [{
        data: data,
      }]
    },
    options: {
      responsive: true,
      legend: false,
      scales: {
        xAxes: [{
          type: "time",
          display: true
        }],
        yAxes: [{
          type: "linear"
        }]
      }
    }
  })
}

function buildYearOptions(selected=-1) {
  let output = ''
  let thisYear = (new Date()).getFullYear()
  for (let i=1970; i<=thisYear; i++) {
    output += '<option '
    if (i == selected) {
      output += 'selected'
    }
    output += '>'+i+'</option>\n'
  }
  return output
}

window.addEventListener("load", () => {
  let thisYear = (new Date()).getFullYear()
  document.getElementById('start_year').innerHTML = buildYearOptions(thisYear - 2)
  document.getElementById('end_year').innerHTML = buildYearOptions(thisYear)
})
