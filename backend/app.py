import os
import pickle

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ─── Load models at startup ───────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "spam_model.pkl")
VECTORIZER_PATH = os.path.join(SCRIPT_DIR, "vectorizer.pkl")

if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
    print("Model files not found. Running training script first...")
    import subprocess
    subprocess.run(["python", os.path.join(SCRIPT_DIR, "train_model.py")], check=True)

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(VECTORIZER_PATH, "rb") as f:
    vectorizer = pickle.load(f)

print("Models loaded successfully!")


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/ml-api/predict", methods=["POST"])
def predict():
    """
    Accepts JSON: { "message": "email text here" }
    Returns JSON: { "result": "Spam Mail" | "Ham Mail", "prediction": 0 | 1 }
    """
    data = request.get_json(force=True, silent=True)

    if not data or "message" not in data:
        return jsonify({"error": "Missing 'message' field in request body"}), 400

    message = data["message"].strip()
    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400

    # Transform input with the vectorizer, then predict
    transformed = vectorizer.transform([message])
    prediction = int(model.predict(transformed)[0])

    # prediction == 0 → Spam Mail, prediction == 1 → Ham Mail
    result = "Spam Mail" if prediction == 0 else "Ham Mail"

    return jsonify({"result": result, "prediction": prediction})


@app.route("/ml-api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
