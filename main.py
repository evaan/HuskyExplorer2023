from flask import Flask, send_from_directory, request
import logging

app = Flask(__name__, static_folder="static")

@app.route("/")
def serveIndex():
    return send_from_directory("static", "index.html")

@app.post("/motors")
def motors():
    #print(request.form)
    return "Motors posted!"

@app.post("/claw")
def claw():
    print(bool(request.form["enabled"]))
    return "Claw posted!"

@app.route("/<path>")
def serve(path):
    return send_from_directory("static", path)

if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=8080)
