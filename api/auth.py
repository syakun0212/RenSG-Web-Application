import os
from dotenv import load_dotenv
from flask import Blueprint, jsonify, make_response, request
from werkzeug.security import generate_password_hash, check_password_hash
from .models.user import User
from flask_login import current_user, login_user, login_required, logout_user
from . import db, mail
import requests
from flask_mail import Message
from itsdangerous import SignatureExpired, URLSafeSerializer

auth = Blueprint('auth', __name__)

prod_path = "www.rentsg.software"
dev_path = "localhost"

# Get the path to the directory this file is in
BASEDIR = os.path.abspath(os.path.dirname(__file__))
# Connect the path with your '.env' file name
load_dotenv(os.path.join(BASEDIR, '.env'))

auth_s = URLSafeSerializer("secret key")

@auth.route("/user", methods=["GET"])
@login_required
def get_user():
    return make_response(jsonify({"id": current_user.id, "email": current_user.email, "password": current_user.password, "picture": current_user.profile_picture}))


@auth.route('/login', methods=['POST'])
def login_post():
    # login code goes here
    email = request.json['email']
    password = request.json['password']

    user = User.query.filter_by(email=email).first()

    # check if the user actually exists
    # take the user-supplied password, hash it, and compare it to the hashed password in the database
    if not user or not check_password_hash(user.password, password):
        response = make_response(
            jsonify({"message": "Email or Password incorrect."}), 400)
        return response
    # if the above check passes, then we know the user has the right credentials

    # check if user is verified
    if user.isVerified == False:
        response = jsonify({'message': "Email not verified"})
        response.status_code = 401
        return response

    login_user(user)
    return make_response(jsonify({"message": "Successfully authenticated", "password": user.password}), 200)


@auth.route('/signup', methods=['POST'])
def signup_post():
    # code to validate and add user to database goes here
    email = request.json["email"]
    password = request.json["password"]

    # if this returns a user, then the email already exists in database
    user = User.query.filter_by(email=email).first()

    if user:  # if a user is found, we want to redirect back to signup page so user can try again
        response = make_response(
            jsonify({"message": "Email already exists"}), 400)
        return response

    # create a new user with the form data. Hash the password so the plaintext version isn't saved.
    password = generate_password_hash(
        password, method='sha256')
    new_user = User(email=email, password=password)

    # add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    token = auth_s.dumps(email, salt='email-confirm')

    msg = Message('Confirm Email', recipients=[email])

    if os.environ["FLASK_ENV"] == "production":
        link = f"http://{prod_path}/confirm-email/{token}"
    else:
        link = f"http://localhost:3000/confirm-email/{token}"
    msg.body = 'Your link is {}'.format(link)
    mail.send(msg)

    return make_response(jsonify({"message": "Signed up"}), 200)


@auth.route('/logout', methods=["GET"])
@login_required
def logout():
    logout_user()
    return make_response(jsonify({"message": "Logged out"}), 200)


@auth.route('/confirm-email/<token>', methods=['GET'])
def confirm_email(token):
    try:
        email = auth_s.loads(token, salt='email-confirm', max_age=3600)
        user = User.query.filter_by(email=email).first()
        user.isVerified = True
        db.session.commit()
        # create chatengine user
        chat_response = requests.post('https://api.chatengine.io/users/', data={"username": email, "secret": user.password}, headers={
            "PRIVATE-KEY": os.getenv("CHAT_ENGINE_PRIVATE_KEY")
        })
        login_user(user)
        return make_response(jsonify({"id": user.id, "email": user.email, "password": user.password}))
    except SignatureExpired:
        return make_response(jsonify({"message": "Token has expired"}), 401)


@auth.route('/confirm-email', methods=["POST"])
def send_confirm_email():
    email = request.json["email"]

    token = auth_s.dumps(email, salt='email-confirm')

    msg = Message('Confirm Email', recipients=[email])

    if os.environ["FLASK_ENV"] == "production":
        link = f"http://{prod_path}/confirm-email/{token}"
    else:
        link = ""
    msg.body = 'Your link is {}'.format(link)

    mail.send(msg)

    return make_response(jsonify({"message": "Verification email sent"}), 200)
