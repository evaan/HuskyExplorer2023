from flask import Flask, send_from_directory, request
import logging

app = Flask(__name__)
logging.getLogger('werkzeug').setLevel(logging.INFO)

@app.route('/<path:file>', defaults={'file': 'index.html'})
def serve(file):
    return send_from_directory('static', file)

if __name__ == '__main__':
    app.run(port=8080, host='0.0.0.0')
