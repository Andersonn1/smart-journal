from os import environ


class AppConfig(object):
    ADMIN_EMAILS = ["n0a64415@marymount.edu", "andersnate12@gmail.com"]
    SQLAlCHEMY_ECHO = False
    SQLAlCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = (
        environ.get("DATABASE_URL")
        or "postgresql://postgres:password123@localhost:5432/journal"
    )
    FLASK_APP = "app"
    SECRET_KEY = environ.get("SECRET_KEY") or "FakeSecrectKey"
    DEBUG = False
    CORS_HEADERS = "Content-Type"
