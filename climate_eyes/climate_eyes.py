import requests
import urllib.parse
import logging
import time
from datetime import datetime, timedelta
from threading import Timer

BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/historysummary?'
MAX_RESULTS_PER_DAY = 10000
results_remaining = MAX_RESULTS_PER_DAY
logging.basicConfig(filename='climate_eyes.log', level=logging.DEBUG, format='[%(asctime)s] %(levelname)s [%(name)s.%(funcName)s:%(lineno)d] %(message)s')

class ClimateClient:
  """ Query the VisualCrossing API for climate data """

  @staticmethod
  def getHistoryByYear(API_KEY, location, start_year, end_year, units):
    params = { 'minYear': start_year,
      'maxYear': end_year,
      'chronoUnit': 'years',
      'breakBy': 'years',
      'dailySummaries': 'false',
      'location': location,
      'locationMode': 'single',
      'unitGroup': units,
      'key': API_KEY,
      'contentType': 'json'
    }

    resp = RequestFilter.get(BASE_URL, params=params)
    return resp.text


class RequestFilter:
  @staticmethod
  def get(url, params):
    """ Calculate the number of records being requested, based on request type, which is based on params. """

    global results_remaining
    records = 0
    minYear = params.get('minYear')
    maxYear = params.get('maxYear')
    if (minYear and maxYear):
      minYear = int(minYear)
      maxYear = int(maxYear)
      records = maxYear - minYear + 1
    
    logging.getLogger(__name__).debug(f"records remaining: {results_remaining}")

    if (records > results_remaining):
      return ErrorResponse("Data Limit Reached.  Due to licensing restrictions, this site can only provide a limited number of results per day.  Please try again tomorrow.")
    else:
      results_remaining -= records
      return requests.get(url, params)


class ErrorResponse:
  """ Simple wrapper to hold error messages for RequestFilter """
  def __init__(self, text):
    self.text = '{ "message": "' + text + '"}'


class DailyQuotaTimer:
  """ Reset result count each day at midnight. """

  def __init__(self):
    self.reset_result_count()

  @staticmethod
  def seconds_to_midnight():
    """Get the number of seconds until midnight."""
    now = datetime.now()
    tomorrow = now + timedelta(1)
    midnight = datetime(year=tomorrow.year, month=tomorrow.month, 
                        day=tomorrow.day, hour=0, minute=0, second=0, 
                        microsecond=tomorrow.microsecond)
    return (midnight - now).seconds

  @staticmethod
  def reset_result_count():
    global results_remaining
    results_remaining = MAX_RESULTS_PER_DAY
    logging.getLogger(__name__).debug("reset quota")
    time.sleep(2) # wait til tomorrow... an extra second just in case.
    timer = Timer(DailyQuotaTimer.seconds_to_midnight(), DailyQuotaTimer.reset_result_count)
    timer.start()


# Start upon import
timer = DailyQuotaTimer()
