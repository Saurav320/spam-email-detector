from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle

app = Flask(__name__)
CORS(app)

model = pickle.load(open("spam_model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()

    message = data["message"]

    transformed = vectorizer.transform([message])

    prediction = model.predict(transformed)

    if prediction[0] == 0:
        result = "Spam Mail"
    else:
        result = "Ham Mail"

    return jsonify({
        "prediction": result
    })

@app.route("/")
def home():
    return "Spam Detection API Running"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)