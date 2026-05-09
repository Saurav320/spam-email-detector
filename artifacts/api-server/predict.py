import sys
import pickle

# Load trained model
model = pickle.load(open("spam_model.pkl", "rb"))

# Load vectorizer
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

# Get input message
message = sys.argv[1]

# Convert text to vector
message_vector = vectorizer.transform([message])

# Predict
prediction = model.predict(message_vector)

# Return result
if prediction[0] == 0:
    print("Spam Mail")
else:
    print("Ham Mail")