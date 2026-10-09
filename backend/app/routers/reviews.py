from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import Booking, Listing, Review, User
from ..schemas import ReviewCreate


router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"],
)


# =========================================================
# GET REVIEWS FOR A LISTING
# =========================================================

@router.get("/listing/{listing_id}")
def get_listing_reviews(
    listing_id: int,
    session: Session = Depends(get_session),
):
    listing = session.get(Listing, listing_id)

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    reviews = session.exec(
        select(Review)
        .where(Review.listing_id == listing_id)
        .order_by(Review.created_at.desc())
    ).all()

    results = []

    for review in reviews:

        user = session.get(
            User,
            review.user_id,
        )

        results.append(
            {
                **review.model_dump(),
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "avatar_url": user.avatar_url,
                }
                if user
                else None,
            }
        )

    return results


# =========================================================
# CREATE REVIEW
# =========================================================

@router.post("/", status_code=201)
def create_review(
    data: ReviewCreate,
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
    # Check user
    # -----------------------------------------------------

    user = session.get(
        User,
        data.user_id,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )


    # -----------------------------------------------------
    # Validate rating
    # -----------------------------------------------------

    if data.rating < 1 or data.rating > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 1 and 5",
        )


    # -----------------------------------------------------
    # Validate comment
    # -----------------------------------------------------

    if not data.comment.strip():
        raise HTTPException(
            status_code=400,
            detail="Review comment cannot be empty",
        )


    # -----------------------------------------------------
    # Validate booking if provided
    # -----------------------------------------------------

    if data.booking_id is not None:

        booking = session.get(
            Booking,
            data.booking_id,
        )

        if not booking:
            raise HTTPException(
                status_code=404,
                detail="Booking not found",
            )

        if booking.listing_id != data.listing_id:
            raise HTTPException(
                status_code=400,
                detail="Booking does not belong to this listing",
            )

        if booking.guest_id != data.user_id:
            raise HTTPException(
                status_code=403,
                detail="You can only review your own booking",
            )


        # Prevent duplicate review for same booking

        existing_review = session.exec(
            select(Review).where(
                Review.booking_id == data.booking_id
            )
        ).first()

        if existing_review:
            raise HTTPException(
                status_code=409,
                detail="You have already reviewed this booking",
            )


    # -----------------------------------------------------
    # Create review
    # -----------------------------------------------------

    review = Review(
        listing_id=data.listing_id,
        user_id=data.user_id,
        booking_id=data.booking_id,
        rating=data.rating,
        comment=data.comment.strip(),
    )

    session.add(review)
    session.commit()
    session.refresh(review)


    # -----------------------------------------------------
    # Recalculate listing rating
    # -----------------------------------------------------

    all_reviews = session.exec(
        select(Review).where(
            Review.listing_id == data.listing_id
        )
    ).all()

    if all_reviews:

        average_rating = (
            sum(review.rating for review in all_reviews)
            / len(all_reviews)
        )

        listing.rating = round(
            average_rating,
            2,
        )

        listing.review_count = len(
            all_reviews
        )

    else:

        listing.rating = 0.0
        listing.review_count = 0


    session.add(listing)
    session.commit()
    session.refresh(review)


    return review


# =========================================================
# DELETE REVIEW
# =========================================================

@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    session: Session = Depends(get_session),
):
    review = session.get(
        Review,
        review_id,
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )


    listing_id = review.listing_id

    session.delete(review)
    session.commit()


    # Recalculate rating

    listing = session.get(
        Listing,
        listing_id,
    )

    if listing:

        remaining_reviews = session.exec(
            select(Review).where(
                Review.listing_id == listing_id
            )
        ).all()

        if remaining_reviews:

            listing.rating = round(
                sum(
                    review.rating
                    for review in remaining_reviews
                )
                / len(remaining_reviews),
                2,
            )

            listing.review_count = len(
                remaining_reviews
            )

        else:

            listing.rating = 0.0
            listing.review_count = 0

        session.add(listing)
        session.commit()


    return {
        "message": "Review deleted successfully"
    }