import os
import secrets
import boto3
from dotenv import load_dotenv
from flask import Blueprint, jsonify, make_response, request
from flask_login import current_user, login_required
from .models.listingimage import ListingImage
from . import db
from api.models import User

images = Blueprint('images', __name__)

# Get the path to the directory this file is in
BASEDIR = os.path.abspath(os.path.dirname(__file__))

# Connect the path with your '.env' file name
load_dotenv(os.path.join(BASEDIR, '.env'))


@images.route("/images/<int:listing_id>", methods=["GET"])
def get_images(listing_id):
    # get file names from DB
    images = ListingImage.query.filter_by(listing_id=listing_id).all()
    filenames = []
    for image in images:
        filenames.append(image.file_name)

    return make_response(jsonify({"data": filenames}), 200)


@images.route("/images", methods=["PUT"])
@login_required
def upload_image():
    file = request.files["image"]
    filename = secrets.token_hex(8)
    listing_id = request.form.get("listing_id")
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    try:
        bucket = os.getenv("AWS_BUCKET_NAME")
        s3.upload_fileobj(
            file,
            bucket,
            filename,
            ExtraArgs={
                "ACL": "public-read",
                "ContentType": file.content_type
            }
        )
        new_image = ListingImage(listing_id=listing_id, file_name=filename)
        db.session.add(new_image)
        db.session.commit()

    except Exception as e:
        # This is a catch all exception, edit this part to fit your needs.
        print("Something Happened: ", e)
        return make_response(jsonify({"error": e}), 500)

    return make_response(jsonify({"message": filename}), 200)


@images.route("/profile-image", methods=["PUT"])
@login_required
def upload_profile_image():
    file = request.files["image"]
    filename = secrets.token_hex(8)
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    try:
        bucket = os.getenv("AWS_BUCKET_NAME")
        s3.upload_fileobj(
            file,
            bucket,
            filename,
            ExtraArgs={
                "ACL": "public-read",
                "ContentType": file.content_type
            }
        )
        if current_user.profile_picture:
            s3.delete_object(Bucket=bucket, Key=current_user.profile_picture)
        user = User.query.filter_by(id=current_user.id).first()
        user.profile_picture = filename
        db.session.commit()

    except Exception as e:
        # This is a catch all exception, edit this part to fit your needs.
        print("Something Happened: ", e)
        return make_response(jsonify({"error": e}), 500)

    return make_response(jsonify({"message": filename}), 200)
