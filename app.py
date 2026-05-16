from flask import Flask, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

@app.route("/random")
def random_number():
    number = random.randint(1, 100)
    return jsonify({"number": number})

if __name__ == "__main__":
    app.run(debug=True)