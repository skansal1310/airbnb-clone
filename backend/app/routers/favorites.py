from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import Favorite, Listing, ListingImage


router = APIRouter(
    prefix="/api/favorites",
    tags=["Favorites"],
)


# ---------------------------------------------------------
# GET USER FAVORITES
# ---------------------------------------------------------
@router.get("/{user_id}")
def get_favorites(
    user_id: int,
    session: Session = Depends(get_session),
):
    favorites = session.exec(
        select(Favorite)
        .where(Favorite.user_id == user_id)
        .order_by(Favorite.created_at.desc())
    ).all()

    results = []

    for favorite in favorites:
        listing = session.get(
            Listing,
            favorite.listing_id,
        )

        if not listing:
            continue

        images = session.exec(
            select(ListingImage)
            .where(
                ListingImage.listing_id == listing.id
            )
            .order_by(ListingImage.position)
        ).all()

        results.append(
            {
                "favorite_id": favorite.id,
                "listing": {
                    **listing.model_dump(),
                    "images": images,
                },
            }
        )

    return results


# ---------------------------------------------------------
# ADD FAVORITE
# ---------------------------------------------------------
@router.post("/{user_id}/{listing_id}", status_code=201)
def add_favorite(
    user_id: int,
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

    existing = session.exec(
        select(Favorite)
        .where(
            Favorite.user_id == user_id,
            Favorite.listing_id == listing_id,
        )
    ).first()

    if existing:
        return {
            "message": "Listing already saved",
            "favorite_id": existing.id,
        }

    favorite = Favorite(
        user_id=user_id,
        listing_id=listing_id,
    )

    session.add(favorite)
    session.commit()
    session.refresh(favorite)

    return {
        "message": "Listing saved",
        "favorite_id": favorite.id,
    }


# ---------------------------------------------------------
# REMOVE FAVORITE
# ---------------------------------------------------------
@router.delete("/{user_id}/{listing_id}")
def remove_favorite(
    user_id: int,
    listing_id: int,
    session: Session = Depends(get_session),
):
    favorite = session.exec(
        select(Favorite)
        .where(
            Favorite.user_id == user_id,
            Favorite.listing_id == listing_id,
        )
    ).first()

    if not favorite:
        raise HTTPException(
            status_code=404,
            detail="Favorite not found",
        )

    session.delete(favorite)
    session.commit()

    return {
        "message": "Listing removed from favorites"
    }