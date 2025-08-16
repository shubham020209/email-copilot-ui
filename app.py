# app.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Literal

# 1) create the web app
app = FastAPI()

# 2) define the request body schema: must contain a "text" string
class PredictIn(BaseModel):
    text: str

# 3) define the response schema: label is one of these fixed strings, plus a confidence number
class PredictOut(BaseModel):
    label: Literal["bill","bank_txn","subscription","shipment","newsletter","promo","spam","other"] = "bill"
    confidence: float = 0.90

# 4) define the endpoint: POST /predict accepts JSON { "text": "..." } and returns a label + confidence
@app.post("/predict", response_model=PredictOut)
def predict(inp: PredictIn):
    t = inp.text.lower()

    # 5) very simple keyword rules for now (we'll replace with a trained model later)
    if any(k in t for k in ["invoice", "bill", "due", "statement"]):
        return PredictOut(label="bill", confidence=0.92)
    if any(k in t for k in ["debited", "credited", "upi", "payment", "receipt"]):
        return PredictOut(label="bank_txn", confidence=0.88)
    if any(k in t for k in ["subscription", "auto-renew", "renewal", "plan"]):
        return PredictOut(label="subscription", confidence=0.90)
    if any(k in t for k in ["shipped", "tracking", "courier", "awb", "out for delivery"]):
        return PredictOut(label="shipment", confidence=0.90)
    if any(k in t for k in ["unsubscribe", "newsletter", "weekly"]):
        return PredictOut(label="newsletter", confidence=0.85)
    if any(k in t for k in ["sale", "offer", "discount", "deal"]):
        return PredictOut(label="promo", confidence=0.85)
    if any(k in t for k in ["lottery", "prince", "win money", "password reset urgent"]):
        return PredictOut(label="spam", confidence=0.95)

    # 6) default if nothing matched
    return PredictOut(label="other", confidence=0.60)
