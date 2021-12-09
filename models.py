from sqlalchemy.orm import relationship
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    ForeignKey,
    LargeBinary,
    String,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
metadata = Base.metadata


class User(Base):
    __tablename__ = "User"

    Id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    Email = Column(String, nullable=False, unique=True)
    First_Name = Column(String, nullable=False)
    Last_Name = Column(String, nullable=False)
    Profile_Img = Column(LargeBinary)
    Is_Admin = Column(Boolean, nullable=False)
    Is_Active = Column(Boolean, nullable=False, server_default=text("true"))
    Create_Date = Column(Date, nullable=False, server_default=text("now()"))
    Delete_Date = Column(Date, onupdate=text("now()"))


class Journal(Base):
    __tablename__ = "Journal"

    Id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    Title = Column(String(250), nullable=False, unique=True)
    Body = Column(String, nullable=False)
    Create_Date = Column(Date, nullable=False, server_default=text("now()"))
    Is_Active = Column(Boolean, nullable=False, server_default=text("true"))
    User_Id = Column(ForeignKey("User.Id"), nullable=False)
    Delete_Date = Column(Date, onupdate=text("now()"))

    User = relationship("User")


class UserLogin(Base):
    __tablename__ = "User_Login"

    Id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    User_Id = Column(ForeignKey("User.Id"), nullable=False)
    Password = Column(String)
    Last_Login = Column(
        Date, nullable=False, server_default=text("now()"), onupdate=text("now()")
    )

    User = relationship("User")


class EntryMood(Base):
    __tablename__ = "Entry_Mood"

    Id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    Journal_Id = Column(ForeignKey("Journal.Id"), nullable=False)
    Mood = Column(String, nullable=False)
    User_Id = Column(ForeignKey("User.Id"), nullable=False)

    Journal = relationship("Journal")
    User = relationship("User")
