async function lookup_weather(e) {
  e.preventDefault()
  let location = encodeURIComponent(document.getElementById("location").value)
  let start_year = encodeURIComponent(document.getElementById("start_year").value)
  let end_year = encodeURIComponent(document.getElementById("end_year").value)
  let month = encodeURIComponent(document.getElementById("month").value)
  let units = encodeURIComponent(document.getElementById("units").value)
  let url = `/climate-eyes/app/yearly?location=${location}&start_year=${start_year}&end_year=${end_year}&units=${units}`

  console.log("fetching url: "+url)

  // fetch data
  response = await fetch(url)
  json = await response.json()
  console.log(json)

  // translate to graph format
  let raw_data = []
  if (json.location && json.location.values) {
    json.location.values.forEach((row) => {
      raw_data.push([parseInt(row.period.split(" ")[0]), row.temp])
    })

    // init graph
    await initializeChart(raw_data)
  } else {
    // Assume its an error
    let e = document.querySelector(".error")
    e.innerHTML = json.message
  }

  return false
}

function formatForChart(data) {
  let chart_data = []
  data.forEach((pair) => {
    chart_data.push({ x: pair[0], y: pair[1] })
  })
  return chart_data
}

async function initializeChart(data) {
  return new Promise((resolve, reject) => {
    let chart_data = formatForChart(data)

    let line_data = []
    let result = regression.linear(data)
    line_data.push(result.points[0])
    line_data.push(result.points[result.points.length - 1])
    line_data = formatForChart(line_data)

    new Chart(document.getElementById("chart"), {
      type: 'scatter',
      data: {
        //labels: labels,
        datasets: [{
          data: chart_data,
        },
        {
          data: line_data,
          type: 'line',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2
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
    resolve()
  })
}

function buildYearOptions(selected=-1) {
  let output = ''
  let thisYear = (new Date()).getFullYear()
  for (let i=1970; i<thisYear; i++) {
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
  document.getElementById('start_year').innerHTML = buildYearOptions(thisYear - 11)
  document.getElementById('end_year').innerHTML = buildYearOptions(thisYear - 1)
})
