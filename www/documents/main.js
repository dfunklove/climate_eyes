var DEG_F = "℉"
var DEG_C = "℃"
var UNIT_US = "US"
var UNIT_METRIC = "Metric"

async function lookup_weather(e) {
  e.preventDefault()
  clearErrors()
  disableSubmit()
  let url = new URL(`${window.location.protocol}//${window.location.host}/climate-eyes/app/yearly`)
  let error_list = []
  let elems = document.querySelector(".climate-controls").querySelectorAll("input,select")
  elems.forEach(function(e) {
    let id = e.id
    let value = e.value
    if (value && value.length > 0)
      url.searchParams.append(id, value)
    else
      error_list.push("Please enter a value for "+id.replaceAll("_", " "));
  })
  if (error_list.length > 0) {
    handleErrors(error_list)
    enableSubmit()
    return false
  }

  console.log("fetching url: "+url)

  // fetch data
  response = await fetch(url)
  json = await response.json()
  console.log(json)

  let raw_data = []
  if (json.location && json.location.values) {
    // translate to graph format
    json.location.values.forEach((row) => {
      raw_data.push([parseInt(row.period.split(" ")[0]), row.temp])
    })
    let location_name = json.location.name
    let start_year = raw_data[0][0]
    let end_year = raw_data[raw_data.length - 1][0]
    let units = document.getElementById("units").value
    initDataHeading(location_name, start_year, end_year)
    initStatSelector(json.columns)
    await initializeChart(raw_data, units)
  } else {
    // Assume its an error
    handleErrors([json.message])
  }

  enableSubmit()
  hideSearchForm()
  return false
}

function handleErrors(error_list) {
  let e = document.querySelector(".error")
  e.innerHTML = error_list.reduce((accumulator, currentValue) => accumulator + "<br>" + currentValue)
}

function clearErrors() {
  let e = document.querySelector(".error")
  e.innerHTML = ""
}

function disableSubmit() {
  let submit = document.getElementById("climate-submit")
  submit.disabled = true
  submit.value = "Loading..."
}

function enableSubmit() {
  let submit = document.getElementById("climate-submit")
  submit.disabled = false
  submit.value = "GO"
}

function hideSearchForm() {
  document.querySelector(".climate-controls").classList.add("hidden")
  document.querySelector(".climate-data-heading-container").classList.remove("hidden")
  document.querySelector(".climate-data-container").classList.remove("hidden")
}

function showSearchForm() {
  document.querySelector(".climate-controls").classList.remove("hidden")
  document.querySelector(".climate-data-heading-container").classList.add("hidden")
  document.querySelector(".climate-data-container").classList.add("hidden")
}

function initDataHeading(location_name, start_year, end_year) {
  document.querySelector(".heading-location-name").innerHTML = location_name
  document.querySelector(".heading-start-year").innerHTML = start_year
  document.querySelector(".heading-end-year").innerHTML = end_year
}

/*
 * data is assumed to be in the format [[a,b], [c,d]]
 * the first of each pair is assumed to be a year, the second can be anything
 */
function formatForChart(data) {
  let chart_data = []
  data.forEach((pair) => {
    let year = new Date(pair[0].toString())
    chart_data.push({ x: year, y: pair[1] })
  })

  // change last year from XXXX-01-01 to XXXX-12-31
  let last_year = chart_data[chart_data.length - 1].x
  last_year.setFullYear(data[data.length - 1][0])
  last_year.setMonth(1)
  last_year.setDate(2) // one day off to hide time zone conversion errors
  return chart_data
}

/*
 * setup the chart and populate with data
 * also calls initStats
 */
async function initializeChart(data, units) {
  return new Promise((resolve, reject) => {
    let chart_data = formatForChart(data)

    let line_data = []
    let result = regression.linear(data)
    line_data.push(result.points[0])
    line_data.push(result.points[result.points.length - 1])
    line_data = formatForChart(line_data)

    initStats(result.equation[0], data, units)
    
    new Chart(document.getElementById("chart"), {
      type: 'scatter',
      data: {
        datasets: [{
          data: chart_data,
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2
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
        },
        title: {
          display: true,
          text: "Mean Temperature By Year",
          fontSize: "16"
        }
      }
    })
    resolve()
  })
}

/*
 * Calculate min_change, max_change and populate the UI components
 * points are assumed to be in the format [[a1,a2], [b1,b2]]
 */
function initStats(mean_change, points, units) {
  let max_change = points[1][1] - points[0][1]
  let min_change = max_change

  // process the points in pairs starting with 1 and 2
  for (let i=2; i<points.length; i++) {
    let change = points[i][1] - points[i-1][1]
    if (change > max_change)
      max_change = change
    else if (change < min_change)
      min_change = change
  }
  let per_decade = 10 * mean_change

  document.querySelector(".stat-mean .stat-value").innerHTML = formatTemperature(mean_change, units)
  document.querySelector(".stat-max .stat-value").innerHTML = formatTemperature(max_change, units)
  document.querySelector(".stat-min .stat-value").innerHTML = formatTemperature(min_change, units)
  document.querySelectorAll(".stat-period").forEach((e) => { e.innerHTML = "For "+points.length+" years" })

  document.querySelector(".stat-summary .stat-value").innerHTML = "Temperature is " + (per_decade >= 0 ? "increasing" : "decreasing")
    + " " + formatTemperature(per_decade, units) + " every 10 years"
  if (mean_change >= 0) {
    document.querySelector(".stat-summary .uparrow").classList.remove("hidden")
    document.querySelector(".stat-summary .downarrow").classList.add("hidden")
  } else {
    document.querySelector(".stat-summary .uparrow").classList.add("hidden")
    document.querySelector(".stat-summary .downarrow").classList.remove("hidden")
  }
}

function formatTemperature(temp_float, units) {
  return findMinimumPrecision(temp_float) + (units == UNIT_US ? DEG_F : DEG_C)
}

/*
 * round to the first non-zero digit after the decimal
 * if the next digit is non-zero, include it as well
 * 
 * return a string representing the rounded number
 */
function findMinimumPrecision(n) {
  let retval
  let n_str = n.toString()
  let dot_index = n_str.indexOf(".")
  if (dot_index === -1)
    return n.toString()

  let min_precision = 0
  for (let i=dot_index+1; i<n_str.length; i++) {
    if (n_str.charAt(i) !== "0") {
      min_precision = i - dot_index
      if (i+1 < n_str.length && n_str.charAt(i+1) !== "0") {
        min_precision = i - dot_index
      }
      break
    }
  }
  return n.toFixed(min_precision)
}

function initStatSelector(columns) {
  
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
  document.getElementById('start_year').innerHTML = buildYearOptions(thisYear - 10)
  document.getElementById('end_year').innerHTML = buildYearOptions(thisYear - 1)
})
