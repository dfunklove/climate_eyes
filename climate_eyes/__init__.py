import os
from flask import Flask, request
from . import climate_eyes

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=False)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # a simple page for testing
    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    @app.route('/yearly')
    def getHistoryByYear():
        location = request.args.get('location')
        start_year = request.args.get('start_year')
        end_year = request.args.get('end_year')
        units = request.args.get('units', default="").lower()
        return climate_eyes.ClimateClient.getHistoryByYear(app.config["API_KEY"], location, start_year, end_year, units)

    return app
