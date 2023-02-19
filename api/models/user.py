from email.policy import default
from api import db
from flask_login import UserMixin


class User(UserMixin, db.Model):
    # primary keys are required by SQLAlchemy
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    isVerified = db.Column(db.Boolean, default=False)
    profile_picture = db.Column(db.String(16))
    listings = db.relationship("Listing", back_populates="seller")
    bids = db.relationship("Bid", back_populates="bidder")
