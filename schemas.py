from marshmallow import Schema
from models import User, Journal, EntryMood, UserLogin


class UserSchema(Schema):
    """User Schema"""

    class Meta:
        model = User
        fields = (
            "Id",
            "Email",
            "First_Name",
            "Last_Name",
            "Profile_Img",
            "Is_Admin",
            "Is_Active",
            "Create_Date",
            "Delete_Date",
        )


user_schema = UserSchema()
users_schema = UserSchema(many=True)


class JournalSchema(Schema):
    """Journal Schema"""

    class Meta:
        model = Journal
        fields = (
            "Id",
            "Title",
            "Body",
            "User_Id",
            "Is_Active",
            "Create_Date",
            "Delete_Date",
        )


journal_schema = JournalSchema()
journals_schema = JournalSchema(many=True)


class EntryMoodSchema(Schema):
    """EntryMood Schema"""

    class Meta:
        model = EntryMood
        fields = (
            "Id",
            "Journal_Id",
            "User_Id",
            "Mood",
        )


entry_mood_schema = EntryMoodSchema()
entry_moods_schema = EntryMoodSchema(many=True)


class UserLoginSchema(Schema):
    """UserLogin Schema"""

    class Meta:
        model = UserLogin
        fields = (
            "Id",
            "User_Id",
            "Password",
            "Last_Login",
        )


user_login_schema = UserLoginSchema()
user_logins_schema = UserLoginSchema(many=True)
