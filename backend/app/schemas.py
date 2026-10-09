from datetime import date
from typing import Optional

from pydantic import BaseModel


class ListingImageResponse(BaseModel):
    id: int
    url: str
    position: int


class AmenityResponse(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None


class ListingResponse(BaseModel):
    id: int
    host_id: int

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

    rating: float
    review_count: int

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    images: list[ListingImageResponse] = []
    amenities: list[AmenityResponse] = []


class ListingCreate(BaseModel):
    host_id: int

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

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    image_urls: list[str] = []
    amenities: list[str] = []


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    location: Optional[str] = None
    country: Optional[str] = None
    price_per_night: Optional[float] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    image_urls: Optional[list[str]] = None
    amenities: Optional[list[str]] = None
# ---------------------------------------------------------
# BOOKING SCHEMAS
# ---------------------------------------------------------

from datetime import date


class BookingCreate(BaseModel):
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int
class ReviewCreate(BaseModel):
    listing_id: int
    user_id: int
    booking_id: Optional[int] = None
    rating: int
    comment: str