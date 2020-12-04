# climate_eyes
Climate Eyes is a web application providing an overview of long term climate trends in a given area.  The weather data comes from from [Visual Crossing][1].

## How does Climate Eyes work?
The app consists of a client and server.  The server side is a Python app which retrieves data from [Visual Crossing][1] and serves it over a REST API. The client is Javascript/HTML.

## Who uses Climate Eyes?
This app would be most useful for someone who needs to follow a single financial asset with accuracy down to the second.

## What is the goal of this project?
I created this project to demonstrate the use of Websockets in Python.  It could provide a starting point for a more complex app with features like price alerts.

## How to install
### Client
The web client expects the server app to be running on the same host.  These instructions assume you already have a running http server such as Nnginx or Apache.

This project uses Jekyll to integrate with the layout of my portfolio-site project.  It includes a default layout for use outside the portfolio.  To run the build:
1. cd into www/documents and run 'jekyll build'.  The output will appear in the \_site folder.  
2. Copy the contents of the \_site folder to a location where it can be served by your http server.

### Server
To install the server app, clone the repository onto your web server and run the following commands.
```
cd <project directory>
python setup.py bdist_wheel
pip install dist/climate_eyes-1.0-py3-none-any.whl
```
To run the app you will need a WSGI server such as [Gunicorn][2].  The app itself is created by a function, so you will need to pass this function to your WSGI server.  Here's how that looks with Gunicorn.

    gunicorn 'climate_eyes:create_app()' -k gthread --bind 0.0.0.0:5002 --keyfile private_key.pem --certfile my_cert_chain.pem

Let's break down those parameters.
- bind: You can bind to whatever port you want, but it must match the port in your websocket proxy (see below).  
- keyfile, certfile: These are required because the client needs a secure connection.  
- -k gthread: This specifies the concurrency model, making the server multi-threaded.  This allows the server to handle more than one request at a time.

### API Key
The server app requires a Visual Crossing API key in order to run.  The value must be set in a Python file, config.py, stored in the Flask [instance folder][3].  This folder is located at $PREFIX/var/climate_eyes-instance.  As per the Flask documentation:

> $PREFIX is the prefix of your Python installation. This can be /usr or the path to your virtualenv. You can print the value of sys.prefix to see what the prefix is set to.

The file need only contain a single variable assignment:

    API_KEY = "[YOUR API KEY HERE]"

The Flask app will load this file at startup.  If it can't find the file, it will print out a handy error message saying exactly where it expects to find the file.

### Websocket Proxy
Because this project uses websockets, you must setup a websocket proxy on your http server.  Each server does this differently.  I use Nginx and have provided instructions below.

#### Nginx Configuration
The project includes a sample Nginx configuration file in the nginx_conf folder.
- If you have a working Nginx conf file, copy the end of the sample, the lines after the comment 'websocket proxy' but excluding the final '}', into the server block in your own conf file.
- If you are setting up Nginx from scratch, you can use the sample file as your default configuration.  Fill in your domain and the locations of your certificate and key files, and copy the file to the conf.d folder in your Nginx installation.

## Running the Application
Open the web client in your web browser.  The location will depend on where you stored the files under the document root.  If you stored them in a folder called 'tikka', you would navigate to 'https://<server>/tikka'

Start typing and the autocomplete should provide a list of financial symbols that match.  Select one and click 'GO'.  The graph will say "Waiting for data."  It may take a few seconds for the graph to populate.  This is because at least two data points are required to make a graph.  If you are using the app outside of trading hours, there may not be any price updates to show.  Eventually the graph will time out and say "No data available."

If the app does not behave as expected, the web console should provide some clues as to what is going on.  If you're not using Nginx as your server, the websocket proxy is a good place to start looking for errors.

## Updating the List of Symbols
The list of symbols is stored in the file symbol_list.json in the www folder.  The autocomplete function of the web page reads from this file to give suggestions.  If you wish to update the list, follow the steps below.

1. Download three lists from FinnHub: Stock Company Symbols, Forex Symbols, and Crypto Symbols.   Links can be found the the FinnHub API documentation.
2. Remove the '[' and ']' characters from the beginning and end of each file.
3. Concactenate the three files into one big file.
4. Add one '[' at the beginning and one ']' at the end to make a single JSON array.
5. Copy the file to the environment where you installed the server app, anywhere you are able to run tikka_server.py.
6. Run this command:
    transform.py [input_file] > symbol_list.json
7. Copy symbol_list.json to the folder where you stored the tikka web app.  Look for the old symbol_list.json and replace it with the new file.

That's it!  Your symbol list is now up to date.

I've tried to cover all of the basic information needed to run the app.  If you've got questions or feedback, I'd love to hear from you!  Open an issue and I'll respond as soon as I can.  Happy trading!

[1]: <https://www.visualcrossing.com/resources/documentation/weather-api/weather-api-documentation/> "Visual Crossing"
[2]: <https://gunicorn.org/> "Gunicorn"
[3]: <https://flask.palletsprojects.com/en/1.1.x/config/#instance-folders> "Instance Folders"