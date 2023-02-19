import enum
from api import db
from datetime import datetime


class ListingStatusEnum(enum.Enum):
    open = "open"
    closed = "closed"


class Listing(db.Model):
    # primary keys are required by SQLAlchemy
    id = db.Column(db.Integer, primary_key=True)
    postalCode = db.Column(db.Integer, nullable=False)
    location = db.Column(db.String(30), nullable=False)
    isRoom = db.Column(db.Boolean, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    price = db.Column(db.Float, nullable=False)
    numRooms = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow)
    status = db.Column(db.Enum(ListingStatusEnum), default="open")
    seller_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    seller = db.relationship(
        "User", back_populates="listings")
    images = db.relationship("ListingImage", back_populates="listing")
    bids = db.relationship("Bid", back_populates="listing")
