import logging
from flask import Flask, request
from climate_eyes import ClimateClient
app = Flask(__name__)

@app.route('/yearly')
def getHistoryByYear():
  location = request.args.get('location')
  start_year = request.args.get('start_year')
  end_year = request.args.get('end_year')
  units = request.args.get('units', default="").lower()

  return ClimateClient.getHistoryByYear(location, start_year, end_year, units)

if __name__=="__main__":
  app.run(ssl_context=('fullchain.pem', 'privkey.pem'), port=5002)