from flask import Flask, request, jsonify, make_response

app = Flask(__name__)

@app.route('/', methods=['OPTIONS', 'GET', 'POST', 'HEAD'])
def handle_request():
    if request.method == 'GET':
        response = {
            "message": "GET request received",
            "data": request.form
        }
        return jsonify(response)

    elif request.method == 'POST':
        response = {
            "message": "POST request received",
            "parameters": request.form
        }
        return jsonify(response)

    elif request.method == 'HEAD':
        response = make_response("", 200)
        response.headers["Custom-Header"] = "This is a HEAD response"
        return response

    elif request.method == 'OPTIONS':
        response = make_response("", 200)
        response.headers["Allow"] = "GET, POST, HEAD, OPTIONS"
        return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
