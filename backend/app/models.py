from datetime import date, datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


def utc_now():
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)

    name: str
    email: str = Field(index=True)
    role: str = Field(default="guest")

    avatar_url: Optional[str] = None
    bio: Optional[str] = None

    is_superhost: bool = False

    created_at: datetime = Field(
        default_factory=utc_now
    )


class Listing(SQLModel, table=True):
    __tablename__ = "listings"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )

    host_id: int = Field(
        foreign_key="users.id",
        index=True
    )

    title: str
    description: str

    property_type: str
    location: str
    country: str

    price_per_night: float

    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float

    rating: float = 0.0
    review_count: int = 0

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    created_at: datetime = Field(
        default_factory=utc_now
    )


class ListingImage(SQLModel, table=True):
    __tablename__ = "listing_images"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )

    listing_id: int = Field(
        foreign_key="listings.id",
        index=True
    )

    url: str
    position: int = 0


class Amenity(SQLModel, table=True):
    __tablename__ = "amenities"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )

    name: str = Field(index=True)
    icon: Optional[str] = None


class ListingAmenity(SQLModel, table=True):
    __tablename__ = "listing_amenities"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )

    listing_id: int = Field(
        foreign_key="listings.id",
        index=True
    )

    amenity_id: int = Field(
        foreign_key="amenities.id",
        index=True
    )


class Booking(SQLModel, table=True):
    __tablename__ = "bookings"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )

    listing_id: int = Field(
        foreign_key="listings.id",
        index=True
    )

    guest_id: int = Field(
        foreign_key="users.id",
        index=True
    )

    check_in: date
    check_out: date

    guests: int

    nights: int
    nightly_price: float

    cleaning_fee: float = 0.0
    service_fee: float = 0.0

    total_price: float

    status: str = Field(
        default="confirmed"
    )

    created_at: datetime = Field(
        default_factory=utc_now
    )


class Review(SQLModel, table=True):
    __tablename__ = "reviews"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )

    listing_id: int = Field(
        foreign_key="listings.id",
        index=True
    )

    user_id: int = Field(
        foreign_key="users.id",
        index=True
    )

    booking_id: Optional[int] = Field(
        default=None,
        foreign_key="bookings.id"
    )

    rating: int
    comment: str

    created_at: datetime = Field(
        default_factory=utc_now
    )


class Favorite(SQLModel, table=True):
    __tablename__ = "favorites"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )

    user_id: int = Field(
        foreign_key="users.id",
        index=True
    )

    listing_id: int = Field(
        foreign_key="listings.id",
        index=True
    )

    created_at: datetime = Field(
        default_factory=utc_now
    )