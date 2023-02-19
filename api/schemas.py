from xml.etree.ElementInclude import include
from api import ma
from api.models.bid import Bid, BidStatusEnum
from .models.listingimage import ListingImage
from .models.user import User
from .models.listing import Listing, ListingStatusEnum
from marshmallow_enum import EnumField


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User


class ListingImageSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ListingImage


class ListingSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Listing
    status = EnumField(BidStatusEnum)
    seller = ma.Nested(UserSchema(only=("email",)))
    images = ma.Nested(ListingImageSchema, many=True)


class BiddingSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Bid
    status = EnumField(ListingStatusEnum)
    bidder = ma.Nested(UserSchema(only=("email",)))
    listing = ma.Nested(ListingSchema(only=("id",)))


class BiddingAndListingSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Bid
    status = EnumField(ListingStatusEnum)
    bidder = ma.Nested(UserSchema(only=("email",)))
    listing = ma.Nested(ListingSchema)
