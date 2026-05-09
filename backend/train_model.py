"""
train_model.py
--------------
Trains a Naive Bayes spam classifier and saves:
  - spam_model.pkl    (trained model)
  - vectorizer.pkl    (fitted TF-IDF vectorizer)

Run once before starting app.py, or let app.py call it automatically.
"""

import os
import pickle

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

# ─── Training data ────────────────────────────────────────────────────────────
spam_messages = [
    "Congratulations! You've won a free prize. Click here to claim.",
    "FREE! Win a million dollars right now! Limited time offer!",
    "You have been selected for a special offer. Call now!",
    "Make money fast! Work from home. Earn $5000 weekly!",
    "URGENT: Your account has been compromised. Click to verify!",
    "Claim your reward! You're today's lucky winner!",
    "Buy cheap medicines online. No prescription needed.",
    "Investment opportunity! 100% guaranteed returns.",
    "Hot singles in your area! Click here now!",
    "You've been pre-approved for a $50,000 loan!",
    "Lose weight fast with this one weird trick!",
    "Nigerian prince wants to share his fortune with you.",
    "Your iPhone has been selected as the winner!",
    "Click now to unsubscribe and receive your free gift!",
    "WINNER! As a valued subscriber you have been selected to receive a prize.",
    "FREE entry into our $1000 competition just text 12345.",
    "Cash prize waiting for you! You are our lucky winner!",
    "Get rich quick! No experience required.",
    "Work from home and earn unlimited income!",
    "Special promotion: buy one get two free today only!",
    "Your credit score doesn't matter, get loans now!",
    "Exclusive offer for you: click to claim your prize today!",
    "Send this to 10 friends and win $100!",
    "Online casino bonus: get $500 free chips now!",
    "Urgent! Limited time offer expires in 24 hours!",
    "You have won a Nokia 6610 mobile phone. To claim call now.",
    "Double your money guaranteed! Invest today.",
    "Enlarge your income. Work 2 hours per day and earn thousands.",
    "Free ringtones! Just text RING to 80488.",
    "You are a winner! Please call this number to claim your prize.",
    "Act now! This offer expires soon. Don't miss out!",
    "Make $500 a day from home working online. Register now.",
    "Congratulations on your new home loan pre-approval!",
    "CASH IN NOW! You have been selected. Respond immediately.",
    "Buy V1agra online cheap no prescription needed fast delivery.",
]

ham_messages = [
    "Hi, are you coming to the meeting tomorrow?",
    "Please find the attached report for your review.",
    "Can we reschedule our appointment to next Tuesday?",
    "Thanks for your help with the project yesterday.",
    "I'll be at the office around 9am. See you then!",
    "Could you please send me the latest version of the document?",
    "Happy birthday! Hope you have a wonderful day.",
    "The project deadline has been moved to Friday.",
    "Let me know if you need any help with the report.",
    "I've finished reviewing the code changes. Looks good!",
    "Can you pick up some groceries on your way home?",
    "The conference call is scheduled for 3pm today.",
    "Thank you for the detailed feedback on my proposal.",
    "I'll send you the updated schedule by end of day.",
    "Great work on the presentation! The client loved it.",
    "Are you available for lunch next Wednesday?",
    "I've cc'd John on this email for his awareness.",
    "Please review and sign the attached contract.",
    "The server maintenance is scheduled for this weekend.",
    "Call me when you get a chance, it's about the project.",
    "Meeting notes from yesterday are attached for reference.",
    "Your package has been shipped and will arrive tomorrow.",
    "Thanks for attending the webinar. Recording is here.",
    "Team outing is confirmed for next Friday evening.",
    "Can you explain the bug you found in the system?",
    "The report is ready. Please review before sending it out.",
    "I will be working from home tomorrow. Available on Slack.",
    "Dinner at 7pm sounds great! See you there.",
    "Reminder: your dentist appointment is at 2pm Thursday.",
    "Please complete the quarterly survey when you get a chance.",
    "We need to discuss the budget for Q3 in our next meeting.",
    "The new version has been deployed to staging for review.",
    "Your subscription has been renewed. Receipt attached.",
    "Just following up on my email from last week.",
    "Let me know your thoughts on the proposal when ready.",
]

# Spam = 0, Ham = 1
messages = spam_messages + ham_messages
labels = [0] * len(spam_messages) + [1] * len(ham_messages)

# ─── Vectorize ────────────────────────────────────────────────────────────────
vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=5000,
    ngram_range=(1, 2),
)
X = vectorizer.fit_transform(messages)

# ─── Train ────────────────────────────────────────────────────────────────────
model = MultinomialNB()
model.fit(X, labels)

# ─── Save ─────────────────────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(script_dir, "spam_model.pkl"), "wb") as f:
    pickle.dump(model, f)

with open(os.path.join(script_dir, "vectorizer.pkl"), "wb") as f:
    pickle.dump(vectorizer, f)

print("✓ spam_model.pkl and vectorizer.pkl saved successfully.")
