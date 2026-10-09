from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..database import get_session
from ..models import (
    Amenity,
    Booking,
    Favorite,
    Listing,
    ListingAmenity,
    ListingImage,
    Review,
)
from ..schemas import ListingCreate, ListingUpdate


router = APIRouter(
    prefix="/api/listings",
    tags=["Listings"],
)


# =========================================================
# GET ALL LISTINGS
# =========================================================

@router.get("/")
def get_listings(
    location: Optional[str] = Query(default=None),
    min_price: Optional[float] = Query(default=None),
    max_price: Optional[float] = Query(default=None),
    property_type: Optional[str] = Query(default=None),
    guests: Optional[int] = Query(default=None),
    host_id: Optional[int] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=50),
    session: Session = Depends(get_session),
):
    statement = select(Listing)

    if location:
        statement = statement.where(
            Listing.location.ilike(f"%{location}%")
        )

    if min_price is not None:
        statement = statement.where(
            Listing.price_per_night >= min_price
        )

    if max_price is not None:
        statement = statement.where(
            Listing.price_per_night <= max_price
        )

    if property_type:
        statement = statement.where(
            Listing.property_type.ilike(f"%{property_type}%")
        )

    if guests is not None:
        statement = statement.where(
            Listing.max_guests >= guests
        )

    if host_id is not None:
        statement = statement.where(
            Listing.host_id == host_id
        )

    offset = (page - 1) * limit

    listings = session.exec(
        statement.offset(offset).limit(limit)
    ).all()

    results = []

    for listing in listings:

        images = session.exec(
            select(ListingImage)
            .where(
                ListingImage.listing_id == listing.id
            )
            .order_by(ListingImage.position)
        ).all()

        results.append(
            {
                **listing.model_dump(),
                "images": images,
            }
        )

    return results


# =========================================================
# GET SINGLE LISTING
# =========================================================

@router.get("/{listing_id}")
def get_listing(
    listing_id: int,
    session: Session = Depends(get_session),
):
    listing = session.get(Listing, listing_id)

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    images = session.exec(
        select(ListingImage)
        .where(
            ListingImage.listing_id == listing_id
        )
        .order_by(ListingImage.position)
    ).all()

    listing_amenity_links = session.exec(
        select(ListingAmenity)
        .where(
            ListingAmenity.listing_id == listing_id
        )
    ).all()

    amenities = []

    for link in listing_amenity_links:

        amenity = session.get(
            Amenity,
            link.amenity_id,
        )

        if amenity:
            amenities.append(amenity)

    return {
        **listing.model_dump(),
        "images": images,
        "amenities": amenities,
    }


# =========================================================
# CREATE LISTING
# =========================================================

@router.post("/", status_code=201)
def create_listing(
    data: ListingCreate,
    session: Session = Depends(get_session),
):
    listing = Listing(
        host_id=data.host_id,
        title=data.title,
        description=data.description,
        property_type=data.property_type,
        location=data.location,
        country=data.country,
        price_per_night=data.price_per_night,
        max_guests=data.max_guests,
        bedrooms=data.bedrooms,
        beds=data.beds,
        bathrooms=data.bathrooms,
        latitude=data.latitude,
        longitude=data.longitude,
    )

    session.add(listing)
    session.commit()
    session.refresh(listing)

    # Add images
    for position, url in enumerate(data.image_urls):

        if not url.strip():
            continue

        image = ListingImage(
            listing_id=listing.id,
            url=url.strip(),
            position=position,
        )

        session.add(image)

    # Add amenities
    for amenity_name in data.amenities:

        amenity_name = amenity_name.strip()

        if not amenity_name:
            continue

        amenity = session.exec(
            select(Amenity).where(
                Amenity.name == amenity_name
            )
        ).first()

        if not amenity:

            amenity = Amenity(
                name=amenity_name
            )

            session.add(amenity)
            session.commit()
            session.refresh(amenity)

        link = ListingAmenity(
            listing_id=listing.id,
            amenity_id=amenity.id,
        )

        session.add(link)

    session.commit()

    return listing


# =========================================================
# UPDATE LISTING
# =========================================================

@router.put("/{listing_id}")
def update_listing(
    listing_id: int,
    data: ListingUpdate,
    session: Session = Depends(get_session),
):
    listing = session.get(
        Listing,
        listing_id,
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    # -----------------------------------------
    # Update normal listing fields
    # -----------------------------------------

    normal_fields = {
        "title",
        "description",
        "property_type",
        "location",
        "country",
        "price_per_night",
        "max_guests",
        "bedrooms",
        "beds",
        "bathrooms",
        "latitude",
        "longitude",
    }

    for key in normal_fields:

        if key in update_data:
            setattr(
                listing,
                key,
                update_data[key],
            )

    session.add(listing)
    session.commit()
    session.refresh(listing)

    # -----------------------------------------
    # Update images
    # -----------------------------------------

    if "image_urls" in update_data:

        old_images = session.exec(
            select(ListingImage).where(
                ListingImage.listing_id == listing_id
            )
        ).all()

        for image in old_images:
            session.delete(image)

        session.commit()

        for position, url in enumerate(
            update_data["image_urls"] or []
        ):

            if not url.strip():
                continue

            image = ListingImage(
                listing_id=listing_id,
                url=url.strip(),
                position=position,
            )

            session.add(image)

        session.commit()

    # -----------------------------------------
    # Update amenities
    # -----------------------------------------

    if "amenities" in update_data:

        old_links = session.exec(
            select(ListingAmenity).where(
                ListingAmenity.listing_id == listing_id
            )
        ).all()

        for link in old_links:
            session.delete(link)

        session.commit()

        for amenity_name in update_data["amenities"] or []:

            amenity_name = amenity_name.strip()

            if not amenity_name:
                continue

            amenity = session.exec(
                select(Amenity).where(
                    Amenity.name == amenity_name
                )
            ).first()

            if not amenity:

                amenity = Amenity(
                    name=amenity_name
                )

                session.add(amenity)
                session.commit()
                session.refresh(amenity)

            link = ListingAmenity(
                listing_id=listing_id,
                amenity_id=amenity.id,
            )

            session.add(link)

        session.commit()

    return {
        "message": "Listing updated successfully",
        "listing": listing,
    }


# =========================================================
# DELETE LISTING
# =========================================================

@router.delete("/{listing_id}")
def delete_listing(
    listing_id: int,
    session: Session = Depends(get_session),
):
    listing = session.get(
        Listing,
        listing_id,
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    # Delete related bookings
    bookings = session.exec(
        select(Booking).where(
            Booking.listing_id == listing_id
        )
    ).all()

    for booking in bookings:
        session.delete(booking)

    # Delete related reviews
    reviews = session.exec(
        select(Review).where(
            Review.listing_id == listing_id
        )
    ).all()

    for review in reviews:
        session.delete(review)

    # Delete favorites
    favorites = session.exec(
        select(Favorite).where(
            Favorite.listing_id == listing_id
        )
    ).all()

    for favorite in favorites:
        session.delete(favorite)

    # Delete images
    images = session.exec(
        select(ListingImage).where(
            ListingImage.listing_id == listing_id
        )
    ).all()

    for image in images:
        session.delete(image)

    # Delete amenity links
    amenity_links = session.exec(
        select(ListingAmenity).where(
            ListingAmenity.listing_id == listing_id
        )
    ).all()

    for link in amenity_links:
        session.delete(link)

    # Delete listing
    session.delete(listing)

    session.commit()

    return {
        "message": "Listing deleted successfully"
    }