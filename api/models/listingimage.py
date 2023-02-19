from api import db


class ListingImage(db.Model):
    # primary keys are required by SQLAlchemy
    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey("listing.id"))
    listing = db.relationship("Listing", back_populates="images")
    file_name = db.Column(db.String(16), nullable=False)
