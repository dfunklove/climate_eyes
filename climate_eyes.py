import requests
import urllib.parse

class ClimateClient:
  def __init__(self):
    self.API_KEY = '34BD7WDY2GHG9T005HH70BW9U'
    self.BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/historysummary?'

  def getHistoryByYear(self, location, start_year, end_year, units):
    #let queryDate = '&startDateTime=' + start_year + '-01-01T00:00:00&endDateTime=' + end_year + '-12-31T23:59:59'
    params = { 'minYear': start_year,
      'maxYear': end_year,
      'chronoUnit': 'years',
      'breakBy': 'years',
      'dailySummaries': 'false',
      'location': location,
      'locationMode': 'single',
      'unitGroup': units,
      'key': self.API_KEY,
      'contentType': 'json'
      }

    resp = requests.get(self.BASE_URL, params=params)
    return resp.text

    
