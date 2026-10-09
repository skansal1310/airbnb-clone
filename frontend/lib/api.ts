const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";


// =========================================================
// LISTINGS
// =========================================================

// ---------------------------------------------------------
// GET ALL LISTINGS
// ---------------------------------------------------------

export async function getListings(params?: {
  location?: string;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  guests?: number;
  host_id?: number;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.location) {
    searchParams.set(
      "location",
      params.location
    );
  }

  if (params?.min_price !== undefined) {
    searchParams.set(
      "min_price",
      String(params.min_price)
    );
  }

  if (params?.max_price !== undefined) {
    searchParams.set(
      "max_price",
      String(params.max_price)
    );
  }

  if (params?.property_type) {
    searchParams.set(
      "property_type",
      params.property_type
    );
  }

  if (params?.guests !== undefined) {
    searchParams.set(
      "guests",
      String(params.guests)
    );
  }

  if (params?.host_id !== undefined) {
    searchParams.set(
      "host_id",
      String(params.host_id)
    );
  }

  if (params?.page !== undefined) {
    searchParams.set(
      "page",
      String(params.page)
    );
  }

  if (params?.limit !== undefined) {
    searchParams.set(
      "limit",
      String(params.limit)
    );
  }

  const query = searchParams.toString();

  const response = await fetch(
    `${API_URL}/api/listings/${
      query ? `?${query}` : ""
    }`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch listings"
    );
  }

  return response.json();
}


// ---------------------------------------------------------
// GET SINGLE LISTING
// ---------------------------------------------------------

export async function getListing(
  id: number
) {
  const response = await fetch(
    `${API_URL}/api/listings/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch listing"
    );
  }

  return response.json();
}


// ---------------------------------------------------------
// CREATE LISTING
// ---------------------------------------------------------

export async function createListing(data: {
  host_id: number;
  title: string;
  description: string;
  property_type: string;
  location: string;
  country: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  latitude?: number | null;
  longitude?: number | null;
  image_urls: string[];
  amenities: string[];
}) {
  const response = await fetch(
    `${API_URL}/api/listings/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to create listing"
    );
  }

  return result;
}


// ---------------------------------------------------------
// UPDATE LISTING
// ---------------------------------------------------------

export async function updateListing(
  listingId: number,
  data: {
    title?: string;
    description?: string;
    property_type?: string;
    location?: string;
    country?: string;
    price_per_night?: number;
    max_guests?: number;
    bedrooms?: number;
    beds?: number;
    bathrooms?: number;
    latitude?: number | null;
    longitude?: number | null;
    image_urls?: string[];
    amenities?: string[];
  }
) {
  const response = await fetch(
    `${API_URL}/api/listings/${listingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to update listing"
    );
  }

  return result;
}


// ---------------------------------------------------------
// DELETE LISTING
// ---------------------------------------------------------

export async function deleteListing(
  listingId: number
) {
  const response = await fetch(
    `${API_URL}/api/listings/${listingId}`,
    {
      method: "DELETE",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to delete listing"
    );
  }

  return result;
}


// =========================================================
// BOOKINGS
// =========================================================

// ---------------------------------------------------------
// CHECK AVAILABILITY
// ---------------------------------------------------------

export async function checkAvailability(
  listingId: number,
  checkIn: string,
  checkOut: string
) {
  const searchParams = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
  });

  const response = await fetch(
    `${API_URL}/api/bookings/availability/${listingId}?${searchParams.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Failed to check availability"
    );
  }

  return data;
}


// ---------------------------------------------------------
// CREATE BOOKING
// ---------------------------------------------------------

export async function createBooking(data: {
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}) {
  const response = await fetch(
    `${API_URL}/api/bookings/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to create booking"
    );
  }

  return result;
}


// ---------------------------------------------------------
// GET GUEST BOOKINGS
// ---------------------------------------------------------

export async function getGuestBookings(
  guestId: number
) {
  const response = await fetch(
    `${API_URL}/api/bookings/guest/${guestId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch bookings"
    );
  }

  return response.json();
}


// =========================================================
// FAVORITES
// =========================================================

// ---------------------------------------------------------
// GET FAVORITES
// ---------------------------------------------------------

export async function getFavorites(
  userId: number
) {
  const response = await fetch(
    `${API_URL}/api/favorites/${userId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch favorites"
    );
  }

  return response.json();
}


// ---------------------------------------------------------
// ADD FAVORITE
// ---------------------------------------------------------

export async function addFavorite(
  userId: number,
  listingId: number
) {
  const response = await fetch(
    `${API_URL}/api/favorites/${userId}/${listingId}`,
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Failed to save favorite"
    );
  }

  return data;
}


// ---------------------------------------------------------
// REMOVE FAVORITE
// ---------------------------------------------------------

export async function removeFavorite(
  userId: number,
  listingId: number
) {
  const response = await fetch(
    `${API_URL}/api/favorites/${userId}/${listingId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Failed to remove favorite"
    );
  }

  return data;
}


// =========================================================
// REVIEWS
// =========================================================

// ---------------------------------------------------------
// GET LISTING REVIEWS
// ---------------------------------------------------------

export async function getListingReviews(
  listingId: number
) {
  const response = await fetch(
    `${API_URL}/api/reviews/listing/${listingId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch reviews"
    );
  }

  return response.json();
}


// ---------------------------------------------------------
// CREATE REVIEW
// ---------------------------------------------------------

export async function createReview(data: {
  listing_id: number;
  user_id: number;
  booking_id?: number | null;
  rating: number;
  comment: string;
}) {
  const response = await fetch(
    `${API_URL}/api/reviews/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to create review"
    );
  }

  return result;
}


// ---------------------------------------------------------
// DELETE REVIEW
// ---------------------------------------------------------

export async function deleteReview(
  reviewId: number
) {
  const response = await fetch(
    `${API_URL}/api/reviews/${reviewId}`,
    {
      method: "DELETE",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to delete review"
    );
  }

  return result;
}
// =========================================================
// NOTIFICATIONS
// =========================================================

export async function getNotifications(
  userId: number
) {
  const response = await fetch(
    `${API_URL}/api/notifications/${userId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch notifications"
    );
  }

  return response.json();
}


export async function markNotificationRead(
  notificationId: number
) {
  const response = await fetch(
    `${API_URL}/api/notifications/${notificationId}/read`,
    {
      method: "PUT",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to mark notification as read"
    );
  }

  return result;
}


export async function deleteNotification(
  notificationId: number
) {
  const response = await fetch(
    `${API_URL}/api/notifications/${notificationId}`,
    {
      method: "DELETE",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.detail ||
        "Failed to delete notification"
    );
  }

  return result;
}