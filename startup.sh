#!/bin/sh
gunicorn 'climate_eyes:create_app()' -k gthread --bind 0.0.0.0:5002 --keyfile privkey.pem --certfile fullchain.pem > gunicorn.log 2>&1
