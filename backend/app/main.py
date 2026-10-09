from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import create_db_and_tables
from .routers import (
    listings,
    bookings,
    favorites,
    reviews,
    notifications,
)


app = FastAPI(
    title="Airbnb Clone API",
    description="Backend API for Airbnb-style booking platform",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# Register routers
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(favorites.router)
app.include_router(reviews.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {
        "message": "Airbnb Clone API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }