from sqlmodel import Session, select

from .database import create_db_and_tables, engine
from .models import (
    Amenity,
    Listing,
    ListingAmenity,
    ListingImage,
    User,
)


LISTINGS = [
    {
        "title": "Luxury Beachfront Villa",
        "description": "A beautiful beachfront villa with stunning ocean views, a private pool and spacious interiors.",
        "property_type": "Villa",
        "location": "Goa",
        "country": "India",
        "price": 8500,
        "guests": 6,
        "bedrooms": 3,
        "beds": 4,
        "bathrooms": 3,
        "rating": 4.92,
        "review_count": 128,
        "images": [
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200",
        ],
        "amenities": [
            "Pool",
            "WiFi",
            "Kitchen",
            "Air conditioning",
            "Free parking",
        ],
    },
    {
        "title": "Cozy Mountain Cabin",
        "description": "A peaceful wooden cabin surrounded by mountains and pine forests.",
        "property_type": "Cabin",
        "location": "Manali",
        "country": "India",
        "price": 5200,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "rating": 4.87,
        "review_count": 94,
        "images": [
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200",
            "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200",
            "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200",
        ],
        "amenities": [
            "WiFi",
            "Fireplace",
            "Kitchen",
            "Heating",
            "Free parking",
        ],
    },
    {
        "title": "Modern Apartment in Paris",
        "description": "A stylish apartment in the heart of Paris, perfect for exploring the city.",
        "property_type": "Apartment",
        "location": "Paris",
        "country": "France",
        "price": 12000,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 1,
        "rating": 4.81,
        "review_count": 213,
        "images": [
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200",
            "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200",
        ],
        "amenities": [
            "WiFi",
            "Kitchen",
            "Washer",
            "Air conditioning",
        ],
    },
    {
        "title": "Tropical Bali Retreat",
        "description": "Relax in this tropical retreat surrounded by greenery and natural beauty.",
        "property_type": "Villa",
        "location": "Bali",
        "country": "Indonesia",
        "price": 6800,
        "guests": 5,
        "bedrooms": 2,
        "beds": 3,
        "bathrooms": 2,
        "rating": 4.95,
        "review_count": 176,
        "images": [
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200",
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200",
            "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=1200",
        ],
        "amenities": [
            "Pool",
            "WiFi",
            "Kitchen",
            "Breakfast",
            "Air conditioning",
        ],
    },
    {
        "title": "Lake View Retreat",
        "description": "A serene home overlooking the beautiful lakes of Udaipur.",
        "property_type": "House",
        "location": "Udaipur",
        "country": "India",
        "price": 6100,
        "guests": 6,
        "bedrooms": 3,
        "beds": 4,
        "bathrooms": 2,
        "rating": 4.79,
        "review_count": 87,
        "images": [
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200",
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200",
        ],
        "amenities": [
            "WiFi",
            "Kitchen",
            "Free parking",
            "TV",
        ],
    },
    {
        "title": "Luxury Downtown Dubai Apartment",
        "description": "Premium apartment with incredible city views near Dubai's top attractions.",
        "property_type": "Apartment",
        "location": "Dubai",
        "country": "UAE",
        "price": 14500,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "rating": 4.88,
        "review_count": 241,
        "images": [
            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
        ],
        "amenities": [
            "Pool",
            "WiFi",
            "Gym",
            "Kitchen",
            "Air conditioning",
        ],
    },
    {
        "title": "Seaside Home in Da Nang",
        "description": "A comfortable modern home close to the beach and local restaurants.",
        "property_type": "House",
        "location": "Da Nang",
        "country": "Vietnam",
        "price": 4800,
        "guests": 5,
        "bedrooms": 2,
        "beds": 3,
        "bathrooms": 2,
        "rating": 4.91,
        "review_count": 112,
        "images": [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200",
        ],
        "amenities": [
            "WiFi",
            "Kitchen",
            "Air conditioning",
            "Free parking",
        ],
    },
    {
        "title": "Minimalist Tokyo Studio",
        "description": "A compact and stylish studio in Tokyo with everything you need for a city stay.",
        "property_type": "Apartment",
        "location": "Tokyo",
        "country": "Japan",
        "price": 7200,
        "guests": 2,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "rating": 4.84,
        "review_count": 154,
        "images": [
            "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200",
            "https://images.unsplash.com/photo-1554797589-7241bb691973?w=1200",
        ],
        "amenities": [
            "WiFi",
            "Kitchen",
            "Washer",
            "Air conditioning",
        ],
    },
    {
        "title": "Santorini Sunset Villa",
        "description": "A stunning Greek villa with beautiful white architecture and sunset views.",
        "property_type": "Villa",
        "location": "Santorini",
        "country": "Greece",
        "price": 18000,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "rating": 4.97,
        "review_count": 305,
        "images": [
            "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200",
            "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=1200",
        ],
        "amenities": [
            "Pool",
            "WiFi",
            "Kitchen",
            "Breakfast",
            "Air conditioning",
        ],
    },
    {
        "title": "Goa Tropical Garden Home",
        "description": "A peaceful tropical home surrounded by lush gardens and close to the beach.",
        "property_type": "House",
        "location": "Goa",
        "country": "India",
        "price": 4300,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "rating": 4.76,
        "review_count": 73,
        "images": [
            "https://images.unsplash.com/photo-1560185008-b033106af5c3?w=1200",
            "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=1200",
        ],
        "amenities": [
            "WiFi",
            "Kitchen",
            "Garden",
            "Free parking",
        ],
    },
    {
        "title": "New York City Loft",
        "description": "A modern loft in Manhattan with incredible access to restaurants and attractions.",
        "property_type": "Loft",
        "location": "New York",
        "country": "USA",
        "price": 16000,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 1,
        "rating": 4.83,
        "review_count": 189,
        "images": [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
        ],
        "amenities": [
            "WiFi",
            "Kitchen",
            "Washer",
            "TV",
        ],
    },
    {
        "title": "Modern Hillside Home",
        "description": "A spacious modern home with panoramic mountain views and peaceful surroundings.",
        "property_type": "House",
        "location": "Shimla",
        "country": "India",
        "price": 5600,
        "guests": 5,
        "bedrooms": 2,
        "beds": 3,
        "bathrooms": 2,
        "rating": 4.89,
        "review_count": 102,
        "images": [
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200",
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200",
        ],
        "amenities": [
            "WiFi",
            "Kitchen",
            "Heating",
            "Free parking",
            "TV",
        ],
    },
]


def seed_database():
    create_db_and_tables()

    with Session(engine) as session:

        existing_listing = session.exec(
            select(Listing)
        ).first()

        if existing_listing:
            print("Database already contains listings.")
            return

        # Create hosts
        hosts = [
            User(
                name="Aarav Mehta",
                email="aarav@example.com",
                role="host",
                bio="Love welcoming travelers to beautiful homes.",
                is_superhost=True,
            ),
            User(
                name="Maya Sharma",
                email="maya@example.com",
                role="host",
                bio="Travel enthusiast and experienced host.",
                is_superhost=True,
            ),
            User(
                name="Daniel Wilson",
                email="daniel@example.com",
                role="host",
                bio="Hosting unique stays around the world.",
                is_superhost=False,
            ),
        ]

        # Create guest
        guest = User(
            name="Alex Guest",
            email="guest@example.com",
            role="guest",
            bio="Travel lover.",
        )

        for host in hosts:
            session.add(host)

        session.add(guest)
        session.commit()

        for host in hosts:
            session.refresh(host)

        session.refresh(guest)

        # Create listings
        for index, data in enumerate(LISTINGS):

            host = hosts[index % len(hosts)]

            listing = Listing(
                host_id=host.id,
                title=data["title"],
                description=data["description"],
                property_type=data["property_type"],
                location=data["location"],
                country=data["country"],
                price_per_night=data["price"],
                max_guests=data["guests"],
                bedrooms=data["bedrooms"],
                beds=data["beds"],
                bathrooms=data["bathrooms"],
                rating=data["rating"],
                review_count=data["review_count"],
            )

            session.add(listing)
            session.commit()
            session.refresh(listing)

            # Add images
            for position, url in enumerate(data["images"]):

                image = ListingImage(
                    listing_id=listing.id,
                    url=url,
                    position=position,
                )

                session.add(image)

            # Add amenities
            for amenity_name in data["amenities"]:

                amenity = session.exec(
                    select(Amenity)
                    .where(Amenity.name == amenity_name)
                ).first()

                if not amenity:

                    amenity = Amenity(
                        name=amenity_name
                    )

                    session.add(amenity)
                    session.commit()
                    session.refresh(amenity)

                listing_amenity = ListingAmenity(
                    listing_id=listing.id,
                    amenity_id=amenity.id,
                )

                session.add(listing_amenity)

        session.commit()

        print("===================================")
        print("Database seeded successfully!")
        print(f"Created {len(LISTINGS)} listings.")
        print("Created 3 hosts.")
        print("Created 1 guest.")
        print("===================================")


if __name__ == "__main__":
    seed_database()