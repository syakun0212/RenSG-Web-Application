from flask import Blueprint, jsonify, make_response, request
from flask_login import current_user, login_required

from api.models.bid import Bid
from api.models.listing import Listing
from api.schemas import BiddingAndListingSchema, BiddingSchema
from . import db

bid = Blueprint('bid', __name__)


@bid.route("/bids/listing/<int:listing_id>", methods=["GET"])
@login_required
def get_bids(listing_id):
    # verify if user is the owner of the listing
    listing = Listing.query.filter(
        Listing.id == listing_id, Listing.seller_id == current_user.id).first()
    # get own bid data if not owner
    if listing is None:
        bid_schema = BiddingSchema()
        bid = Bid.query.filter(Bid.listing_id == listing_id,
                               Bid.bidder_id == current_user.id, Bid.status != "rejected")
        return make_response(jsonify({"bid": bid_schema.dump(bid.first())}), 200)

    bids = Bid.query.filter(
        Bid.listing_id == listing_id, Bid.status != "rejected").order_by(Bid.amount.desc())
    bidding_schema = BiddingSchema(many=True)

    return make_response(jsonify({"bids": bidding_schema.dump(bids.all())}), 200)


@bid.route("/bids/listing/<int:listing_id>/highest", methods=["GET"])
def get_highest_bid(listing_id):
    bid_schema = BiddingSchema()
    bids = Bid.query.filter(Bid.listing_id == listing_id,
                            Bid.status != "rejected").order_by(Bid.amount.desc()).first()
    return make_response(jsonify({"highest": bid_schema.dump(bids)}), 200)


@bid.route("/bids/user/<int:user_id>", methods=["GET"])
@login_required
def get_own_bids(user_id):
    bids = Bid.query.filter_by(bidder_id=user_id).order_by(Bid.date.desc())
    bidding_schema = BiddingAndListingSchema(many=True)

    return make_response(jsonify({"bids": bidding_schema.dump(bids.all())}), 200)


@bid.route("/bids/listing/<int:listing_id>", methods=["POST"])
@login_required
def place_bid(listing_id):
    bidding_data = request.get_json()
    amount = bidding_data["amount"]
    bidder_id = current_user.id

    new_bid = Bid(listing_id=listing_id, bidder_id=bidder_id, amount=amount)

    db.session.add(new_bid)
    db.session.commit()
    return make_response(jsonify({"message": "Successfully created new bidding", "id": new_bid.id}), 200)


@bid.route("/bids/<int:bid_id>", methods=["PUT"])
@login_required
def update_bid_status(bid_id):
    bidding_data = request.get_json()
    status = bidding_data["status"]
    bid = Bid.query.filter_by(id=bid_id).first()
    if status == "approved":
        listing = Listing.query.filter_by(id=bid.listing_id).first()
        listing.status = "closed"
        Bid.query.filter_by(listing_id=bid.listing_id).update(
            {Bid.status: "rejected"})
    bid.status = status
    db.session.commit()
    return make_response(jsonify({"message": "Successfully updated status"}), 200)
