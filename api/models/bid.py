from datetime import datetime
import enum


from api import db


class BidStatusEnum(enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Bid(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey("listing.id"))
    listing = db.relationship("Listing", back_populates="bids")
    bidder_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    bidder = db.relationship("User", back_populates="bids")
    amount = db.Column(db.Integer)
    date = db.Column(db.DateTime, nullable=False,
                     default=datetime.utcnow)
    status = db.Column(db.Enum(BidStatusEnum), default="pending")
