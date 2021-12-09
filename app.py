import jwt
from flask import Flask
from flask import request
from functools import wraps
from flask_cors import CORS
from config import AppConfig
from flask_bcrypt import Bcrypt
from api_response import ApiResponse
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import text2emotion as emotion_detection
from email_validator import validate_email
from models import User, Journal, EntryMood, UserLogin
from schemas import (
    user_schema,
    journal_schema,
    journals_schema,
    entry_mood_schema,
    entry_moods_schema,
)


# Initialize flask app
app = Flask(__name__)
# Set app config
app.config.from_object(AppConfig)
# Register bcrypt for password encrypt/decrypt
password_manager = Bcrypt(app)
# Enable Cors
CORS(app, support_credentials=True)
# Initialize sqlalchemy instance
db = SQLAlchemy(app)


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # jwt is passed in the request header
        if "x-access-token" in request.headers:
            token = request.headers["x-access-token"]
            # return 401 if token is not passed
        if not token:
            return ApiResponse(message="INVALID_TOKEN", success=False, status=401).json

        try:
            # decoding the payload to fetch the stored details
            data = jwt.decode(token, AppConfig.SECRET_KEY, algorithms=["HS256"])
            current_user = (
                db.session.query(User).filter(User.Id == data["user_id"]).first()
            )
        except:
            return ApiResponse(
                message="INVALID_TOKEN_EXPIRED", success=False, status=401
            ).json
        # returns the current logged in users contex to the routes
        return f(current_user, *args, **kwargs)

    return decorated


def is_valid_email(email: str):
    try:
        valid = validate_email(email)
        return valid.email
    except Exception:
        return None


def is_empty(value: str):
    if value is None:
        return True
    return False


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register new user"""
    try:
        data = request.form
        email = data["email"].strip().capitalize()
        first_name = data["first_name"].strip().capitalize()
        last_name = data["last_name"].strip().capitalize()
        pw = data["password"]

        if is_empty(email):
            return ApiResponse(
                message="Email is required", status=404, success=False
            ).json
        if is_empty(first_name):
            return ApiResponse(
                message="First name is required", status=404, success=False
            ).json
        if is_empty(last_name):
            return ApiResponse(
                message="Last name is requried", status=404, success=False
            ).json

        if is_empty(pw):
            return ApiResponse(
                message="Password is required", status=404, success=False
            ).json
        if is_valid_email(email) is None:
            return ApiResponse(
                message="Please enter a valid email", status=404, success=False
            ).json
        isadmin = False
        if email in AppConfig.ADMIN_EMAILS:
            isadmin = True
        user = User(
            Email=email,
            First_Name=first_name,
            Last_Name=last_name,
            Is_Admin=isadmin,
        )

        password_hash = password_manager.generate_password_hash(pw).decode("utf8")
        db.session.add(user)
        db.session.commit()
        db.session.add(UserLogin(User_Id=user.Id, Password=password_hash))
        db.session.commit()
        return ApiResponse(message="User account created", success=True).json
    except Exception as ex:
        print(ex)
        return ApiResponse(message=ex, status=500).json
    finally:
        db.session.close()


@app.route("/authenticate", methods=["GET", "POST"])
def authenticate():
    """Authenticate existing user"""
    try:
        data = request.form
        email = data["email"].strip().capitalize()
        password = data["password"]
        user = db.session.query(User).filter(User.Email == email).first()
        if user:
            user_login = (
                db.session.query(UserLogin).filter(UserLogin.User_Id == user.Id).first()
            )
            if password_manager.check_password_hash(
                user_login.Password.encode("ascii"), password
            ):
                token = jwt.encode(
                    {
                        "user_id": user.Id,
                        "admin": user.Is_Admin,
                        "exp": datetime.utcnow() + timedelta(minutes=60),
                    },
                    AppConfig.SECRET_KEY,
                    "HS256",
                )

                return ApiResponse(
                    message="Success",
                    data=user_schema.dump(user),
                    success=True,
                    jwt=token,
                ).json
            return ApiResponse(
                message="Invalid credentials", status=401, success=False
            ).json
        return ApiResponse(message="Account not found", success=False, status=404).json
    except Exception as ex:
        return ApiResponse(message=str(ex), status=500, success=False).json


@app.route("/user<int:id>", methods=["GET"])
@token_required
def get_user():
    """Get specific user not needed until admin page build"""
    try:
        id = request.args.get("id")
        user = db.session.query(User).get(id)
        if user:
            return ApiResponse(
                message="Success", data=user_schema.dump(user), success=True
            ).json
        return ApiResponse(message="User not found", success=False).json
    except Exception as ex:
        return ApiResponse(message=str(ex), status=500, success=False).json


@app.route("/journal/<int:id>", methods=["GET", "POST"])
@token_required
def get_journal(current_user, id):
    try:
        journal = (
            db.session.query(Journal)
            .filter(Journal.User_Id == current_user.Id, Journal.Id == id)
            .first()
        )
        if journal:
            return ApiResponse(
                message="Success", data=journal_schema.dump(journal), success=True
            ).json
        return ApiResponse(message="Journal not found", success=False).json
    except Exception as ex:
        return ApiResponse(message=str(ex), status=500, success=False).json


@app.route("/journal/all", methods=["GET"])
@token_required
def get_journals(current_user):
    try:
        journals = (
            db.session.query(Journal)
            .filter(Journal.User_Id == current_user.Id, Journal.Is_Active == True)
            .all()
        )
        journal_moods = (
            db.session.query(EntryMood)
            .join(Journal, Journal.Id == EntryMood.Journal_Id)
            .filter(EntryMood.User_Id == current_user.Id, Journal.Is_Active == True)
            .all()
        )
        if journals:
            return ApiResponse(
                message="Success",
                data=journals_schema.dump(journals),
                mood=entry_moods_schema.dump(journal_moods),
                success=True,
            ).json
        return ApiResponse(message="Success", data=[], mood=[], success=True).json
    except Exception as ex:
        return ApiResponse(message=str(ex), status=500, success=False).json


@app.route("/journal/create", methods=["POST"])
@token_required
def create_journal(current_user):
    try:
        data = request.json
        journal = Journal()
        journal.Title = data["title"]
        journal.Body = data["body"]
        journal.User_Id = current_user.Id

        found_match = (
            db.session.query(Journal)
            .filter(Journal.Title == journal.Title, Journal.User_Id == journal.User_Id)
            .first()
        )
        if found_match:
            return ApiResponse(
                message="An entry with thet title {0} already exists".format(
                    journal.Title
                ),
                status=404,
                success=False,
            )
        db.session.add(journal)
        db.session.commit()

        emotions = emotion_detection.get_emotion(str(journal.Body))
        entry_mood = EntryMood()
        entry_mood.Journal_Id = journal.Id
        entry_mood.User_Id = current_user.Id
        entry_mood.Mood = str(emotions)
        db.session.add(entry_mood)
        db.session.commit()
        return ApiResponse(
            message="Success",
            data=journal_schema.dump(journal),
            success=True,
            mood=emotions,
        ).json
    except Exception as ex:
        return ApiResponse(message=str(ex), status=500, success=False).json


@app.route("/journal/update", methods=["POST", "PATCH"])
@token_required
def update_journal(current_user):
    try:
        data = request.json
        print(data)
        journal = db.session.query(Journal).get(data["id"])
        if not journal:
            return ApiResponse("Journal not found", status=404, success=False).json
        journal.Title = data["title"]
        journal.Body = data["body"]
        journal.User_Id = data["user_id"]
        journal.Is_Active = data["is_active"]
        update_mood = True
        if not journal.Is_Active:
            journal.Delete_Date = datetime.now()
            update_mood = False
        db.session.add(journal)
        db.session.commit()
        journal_mood = (
            db.session.query(EntryMood)
            .filter(EntryMood.Journal_Id == journal.Id)
            .first()
        )
        if update_mood:
            journal_mood.Mood = str(emotion_detection.get_emotion(str(journal.Body)))
            db.session.add(journal_mood)
            db.session.commit()
        else:
            db.session.delete(journal_mood)
            db.session.commit()
        return ApiResponse(
            message="Success", data=journal_schema.dump(journal), success=True
        ).json
    except Exception as ex:
        return ApiResponse(message=str(ex), status=500, success=False).json


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
