from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import Booking, Listing
from ..schemas import BookingCreate

# Notification model
from .notifications import Notification


router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"],
)


# =========================================================
# CHECK LISTING AVAILABILITY
# =========================================================

@router.get("/availability/{listing_id}")
def check_availability(
    listing_id: int,
    check_in: date,
    check_out: date,
    session: Session = Depends(get_session),
):
    # -----------------------------------------------------
    # Check listing exists
    # -----------------------------------------------------

    listing = session.get(
        Listing,
        listing_id,
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    # -----------------------------------------------------
    # Validate dates
    # -----------------------------------------------------

    if check_in >= check_out:
        raise HTTPException(
            status_code=400,
            detail="Check-out must be after check-in",
        )

    if check_in < date.today():
        raise HTTPException(
            status_code=400,
            detail="Check-in cannot be in the past",
        )

    # -----------------------------------------------------
    # Check overlapping bookings
    # -----------------------------------------------------

    existing_bookings = session.exec(
        select(Booking)
        .where(
            Booking.listing_id == listing_id,
            Booking.status == "confirmed",
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        )
    ).all()

    available = len(existing_bookings) == 0

    return {
        "listing_id": listing_id,
        "check_in": check_in,
        "check_out": check_out,
        "available": available,
    }


# =========================================================
# CREATE BOOKING
# =========================================================

@router.post("/", status_code=201)
def create_booking(
    data: BookingCreate,
    session: Session = Depends(get_session),
):
    # -----------------------------------------------------
    # Check listing
    # -----------------------------------------------------

    listing = session.get(
        Listing,
        data.listing_id,
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    # -----------------------------------------------------
    # Validate dates
    # -----------------------------------------------------

    if data.check_in >= data.check_out:
        raise HTTPException(
            status_code=400,
            detail="Check-out must be after check-in",
        )

    if data.check_in < date.today():
        raise HTTPException(
            status_code=400,
            detail="Check-in cannot be in the past",
        )

    # -----------------------------------------------------
    # Validate guests
    # -----------------------------------------------------

    if data.guests < 1:
        raise HTTPException(
            status_code=400,
            detail="At least one guest is required",
        )

    if data.guests > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=(
                f"This listing allows a maximum of "
                f"{listing.max_guests} guests"
            ),
        )

    # -----------------------------------------------------
    # Check overlapping confirmed bookings
    # -----------------------------------------------------

    overlapping_booking = session.exec(
        select(Booking)
        .where(
            Booking.listing_id == data.listing_id,
            Booking.status == "confirmed",
            Booking.check_in < data.check_out,
            Booking.check_out > data.check_in,
        )
    ).first()

    if overlapping_booking:
        raise HTTPException(
            status_code=409,
            detail="These dates are no longer available",
        )

    # -----------------------------------------------------
    # Calculate nights
    # -----------------------------------------------------

    nights = (
        data.check_out - data.check_in
    ).days

    # -----------------------------------------------------
    # Calculate pricing
    # -----------------------------------------------------

    nightly_price = listing.price_per_night

    subtotal = (
        nightly_price * nights
    )

    # Mock Airbnb-style cleaning fee
    cleaning_fee = 500.0

    # Mock Airbnb-style service fee
    service_fee = round(
        subtotal * 0.12,
        2,
    )

    total_price = round(
        subtotal
        + cleaning_fee
        + service_fee,
        2,
    )

    # -----------------------------------------------------
    # Create booking
    # -----------------------------------------------------

    booking = Booking(
        listing_id=data.listing_id,
        guest_id=data.guest_id,
        check_in=data.check_in,
        check_out=data.check_out,
        guests=data.guests,
        nights=nights,
        nightly_price=nightly_price,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        total_price=total_price,
        status="confirmed",
    )

    session.add(booking)
    session.commit()
    session.refresh(booking)

    # =====================================================
    # CREATE BOOKING NOTIFICATION
    # =====================================================

    notification = Notification(
        user_id=data.guest_id,
        title="Booking confirmed 🎉",
        message=(
            f"Your booking for '{listing.title}' "
            f"from {data.check_in} to {data.check_out} "
            f"has been confirmed."
        ),
        type="booking",
    )

    session.add(notification)
    session.commit()

    # -----------------------------------------------------
    # Return booking
    # -----------------------------------------------------

    return booking


# =========================================================
# GET USER BOOKINGS
# =========================================================

@router.get("/guest/{guest_id}")
def get_guest_bookings(
    guest_id: int,
    session: Session = Depends(get_session),
):
    bookings = session.exec(
        select(Booking)
        .where(
            Booking.guest_id == guest_id
        )
        .order_by(
            Booking.created_at.desc()
        )
    ).all()

    results = []

    for booking in bookings:

        listing = session.get(
            Listing,
            booking.listing_id,
        )

        results.append(
            {
                **booking.model_dump(),
                "listing": listing,
            }
        )

    return results