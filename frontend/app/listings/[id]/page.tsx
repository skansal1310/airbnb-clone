"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Heart,
  MapPin,
  Star,
  Users,
} from "lucide-react";

import {
  checkAvailability,
  createBooking,
  createReview,
  getFavorites,
  getGuestBookings,
  getListing,
  getListingReviews,
  addFavorite,
  removeFavorite,
} from "@/lib/api";


// ---------------------------------------------------------
// DEMO USER
// ---------------------------------------------------------

const GUEST_ID = 4;


// ---------------------------------------------------------
// TYPES
// ---------------------------------------------------------

interface ListingImage {
  id: number;
  url: string;
  position: number;
}

interface Amenity {
  id: number;
  name: string;
  icon?: string | null;
}

interface Listing {
  id: number;
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
  rating: number;
  review_count: number;
  images?: ListingImage[];
  amenities?: Amenity[];
}

interface Review {
  id: number;
  listing_id: number;
  user_id: number;
  booking_id?: number | null;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    avatar_url?: string | null;
  } | null;
}


// ---------------------------------------------------------
// PAGE
// ---------------------------------------------------------

function ListingDetailContent() {

  const params = useParams();

  const listingId = Number(params.id);


  // -------------------------------------------------------
  // LISTING STATE
  // -------------------------------------------------------

  const [listing, setListing] =
    useState<Listing | null>(null);

  const [loading, setLoading] =
    useState(true);


  // -------------------------------------------------------
  // BOOKING STATE
  // -------------------------------------------------------

  const [checkIn, setCheckIn] =
    useState("");

  const [checkOut, setCheckOut] =
    useState("");

  const [guests, setGuests] =
    useState(1);

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [bookingMessage, setBookingMessage] =
    useState("");

  const [bookingError, setBookingError] =
    useState("");


  // -------------------------------------------------------
  // FAVORITE STATE
  // -------------------------------------------------------

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);


  // -------------------------------------------------------
  // REVIEW STATE
  // -------------------------------------------------------

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const [reviewRating, setReviewRating] =
    useState(5);

  const [reviewComment, setReviewComment] =
    useState("");

  const [reviewBookingId, setReviewBookingId] =
    useState<number | null>(null);

  const [reviewLoading, setReviewLoading] =
    useState(false);

  const [reviewMessage, setReviewMessage] =
    useState("");

  const [reviewError, setReviewError] =
    useState("");


  // -------------------------------------------------------
  // LOAD LISTING
  // -------------------------------------------------------

  useEffect(() => {

    async function loadListing() {

      try {

        setLoading(true);

        const data =
          await getListing(listingId);

        setListing(data);

      } catch (error) {

        console.error(
          "Failed to load listing:",
          error
        );

      } finally {

        setLoading(false);

      }
    }


    if (listingId) {
      loadListing();
    }

  }, [listingId]);


  // -------------------------------------------------------
  // LOAD REVIEWS
  // -------------------------------------------------------

  async function loadReviews() {

    try {

      setReviewsLoading(true);

      const data =
        await getListingReviews(listingId);

      setReviews(data);

    } catch (error) {

      console.error(
        "Failed to load reviews:",
        error
      );

    } finally {

      setReviewsLoading(false);

    }
  }


  useEffect(() => {

    if (listingId) {
      loadReviews();
    }

  }, [listingId]);


  // -------------------------------------------------------
  // LOAD FAVORITE
  // -------------------------------------------------------

  useEffect(() => {

    async function loadFavorite() {

      try {

        const favorites =
          await getFavorites(GUEST_ID);

        const saved =
          favorites.some(
            (item: {
              listing: Listing;
            }) =>
              item.listing.id === listingId
          );

        setIsFavorite(saved);

      } catch (error) {

        console.error(
          "Failed to load favorite:",
          error
        );

      }
    }


    if (listingId) {
      loadFavorite();
    }

  }, [listingId]);


  // -------------------------------------------------------
  // LOAD USER BOOKINGS
  // -------------------------------------------------------

  useEffect(() => {

    async function loadBookings() {

      try {

        const bookings =
          await getGuestBookings(GUEST_ID);

        const eligibleBooking =
          bookings.find(
            (booking: {
              listing_id: number;
            }) =>
              booking.listing_id === listingId
          );

        if (eligibleBooking) {

          setReviewBookingId(
            eligibleBooking.id
          );

        }

      } catch (error) {

        console.error(
          "Failed to load bookings:",
          error
        );

      }
    }


    if (listingId) {
      loadBookings();
    }

  }, [listingId]);


  // -------------------------------------------------------
  // TOGGLE FAVORITE
  // -------------------------------------------------------

  async function handleFavorite() {

    try {

      setFavoriteLoading(true);

      if (isFavorite) {

        await removeFavorite(
          GUEST_ID,
          listingId
        );

        setIsFavorite(false);

      } else {

        await addFavorite(
          GUEST_ID,
          listingId
        );

        setIsFavorite(true);

      }

    } catch (error) {

      console.error(
        "Favorite error:",
        error
      );

    } finally {

      setFavoriteLoading(false);

    }
  }


  // -------------------------------------------------------
  // CALCULATE NIGHTS
  // -------------------------------------------------------

  const nights = useMemo(() => {

    if (!checkIn || !checkOut) {
      return 0;
    }

    const start =
      new Date(checkIn);

    const end =
      new Date(checkOut);

    const difference =
      end.getTime() -
      start.getTime();

    const numberOfNights =
      Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      );

    return numberOfNights > 0
      ? numberOfNights
      : 0;

  }, [checkIn, checkOut]);


  // -------------------------------------------------------
  // PRICE CALCULATION
  // -------------------------------------------------------

  const subtotal =
    listing
      ? listing.price_per_night * nights
      : 0;

  const cleaningFee =
    nights > 0
      ? 500
      : 0;

  const serviceFee =
    subtotal > 0
      ? Math.round(
          subtotal * 0.12 * 100
        ) / 100
      : 0;

  const total =
    subtotal +
    cleaningFee +
    serviceFee;


  // -------------------------------------------------------
  // BOOKING
  // -------------------------------------------------------

  async function handleBooking() {

    setBookingMessage("");
    setBookingError("");


    if (!checkIn || !checkOut) {

      setBookingError(
        "Please select check-in and check-out dates."
      );

      return;
    }


    if (nights <= 0) {

      setBookingError(
        "Check-out must be after check-in."
      );

      return;
    }


    try {

      setBookingLoading(true);


      // Check availability first

      const availability =
        await checkAvailability(
          listingId,
          checkIn,
          checkOut
        );


      if (!availability.available) {

        setBookingError(
          "These dates are not available."
        );

        return;
      }


      // Create booking

      await createBooking({

        listing_id:
          listingId,

        guest_id:
          GUEST_ID,

        check_in:
          checkIn,

        check_out:
          checkOut,

        guests,

      });


      setBookingMessage(
        "Booking confirmed! 🎉"
      );


      // Reload reviews/bookings
      // so review eligibility stays current

      const bookings =
        await getGuestBookings(
          GUEST_ID
        );

      const newBooking =
        bookings.find(
          (booking: {
            listing_id: number;
            check_in: string;
          }) =>
            booking.listing_id === listingId &&
            booking.check_in === checkIn
        );

      if (newBooking) {

        setReviewBookingId(
          newBooking.id
        );

      }

    } catch (error) {

      console.error(
        "Booking error:",
        error
      );

      setBookingError(
        error instanceof Error
          ? error.message
          : "Failed to complete booking."
      );

    } finally {

      setBookingLoading(false);

    }
  }


  // -------------------------------------------------------
  // CREATE REVIEW
  // -------------------------------------------------------

  async function handleReviewSubmit() {

    setReviewMessage("");
    setReviewError("");


    if (!reviewComment.trim()) {

      setReviewError(
        "Please write a comment."
      );

      return;
    }


    if (
      reviewRating < 1 ||
      reviewRating > 5
    ) {

      setReviewError(
        "Please select a rating between 1 and 5."
      );

      return;
    }


    try {

      setReviewLoading(true);


      await createReview({

        listing_id:
          listingId,

        user_id:
          GUEST_ID,

        booking_id:
          reviewBookingId,

        rating:
          reviewRating,

        comment:
          reviewComment.trim(),

      });


      setReviewComment("");

      setReviewRating(5);

      setReviewMessage(
        "Review submitted successfully! ⭐"
      );


      // Reload reviews

      await loadReviews();


      // Reload listing to get updated rating

      const updatedListing =
        await getListing(
          listingId
        );

      setListing(
        updatedListing
      );


      // Reset success message

      setTimeout(() => {

        setReviewMessage("");

      }, 3000);


    } catch (error) {

      console.error(
        "Review error:",
        error
      );

      setReviewError(
        error instanceof Error
          ? error.message
          : "Failed to submit review."
      );

    } finally {

      setReviewLoading(false);

    }
  }


  // -------------------------------------------------------
  // LOADING
  // -------------------------------------------------------

  if (loading) {

    return (

      <main className="min-h-screen bg-white">

        <div className="flex min-h-screen items-center justify-center">

          <p className="text-gray-500">
            Loading listing...
          </p>

        </div>

      </main>

    );

  }


  // -------------------------------------------------------
  // NOT FOUND
  // -------------------------------------------------------

  if (!listing) {

    return (

      <main className="min-h-screen bg-white">

        <div className="flex min-h-screen flex-col items-center justify-center">

          <h1 className="text-2xl font-bold">
            Listing not found
          </h1>

          <Link
            href="/"
            className="mt-4 rounded-full bg-black px-5 py-3 text-white"
          >
            Back to home
          </Link>

        </div>

      </main>

    );

  }


  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  return (

    <main className="min-h-screen bg-white">


      {/* =================================================
          HEADER
      ================================================== */}

      <header className="border-b">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium"
          >

            <ArrowLeft size={18} />

            Back to listings

          </Link>


          <button
            onClick={handleFavorite}
            disabled={favoriteLoading}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >

            <Heart
              size={18}
              className={
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : ""
              }
            />

            {isFavorite
              ? "Saved"
              : "Save"}

          </button>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-8">


        {/* =================================================
            TITLE
        ================================================== */}

        <div className="mb-6">

          <h1 className="text-3xl font-bold">
            {listing.title}
          </h1>


          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">

            <span className="flex items-center gap-1 font-medium">

              <Star
                size={16}
                className="fill-black"
              />

              {listing.rating.toFixed(2)}

            </span>


            <span>
              {listing.review_count} reviews
            </span>


            <span className="flex items-center gap-1">

              <MapPin size={16} />

              {listing.location},{" "}
              {listing.country}

            </span>

          </div>

        </div>


        {/* =================================================
            PHOTO GALLERY
        ================================================== */}

        <div className="grid h-[420px] gap-2 overflow-hidden rounded-2xl md:grid-cols-2">

          {/* MAIN IMAGE */}

          <div className="h-full">

            {listing.images &&
            listing.images.length > 0 ? (

              <img
                src={
                  listing.images[0].url
                }
                alt={listing.title}
                className="h-full w-full object-cover"
              />

            ) : (

              <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
                No image available
              </div>

            )}

          </div>


          {/* SECONDARY IMAGES */}

          <div className="hidden grid-cols-2 gap-2 md:grid">

            {(
              listing.images?.slice(
                1,
                5
              ) || []
            ).map(
              (
                image
              ) => (

                <img
                  key={image.id}
                  src={image.url}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />

              )
            )}

          </div>

        </div>


        {/* =================================================
            CONTENT + BOOKING
        ================================================== */}

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_400px]">


          {/* =================================================
              LEFT SIDE
          ================================================== */}

          <div>


            {/* PROPERTY SUMMARY */}

            <div className="border-b pb-8">

              <h2 className="text-2xl font-semibold">

                {listing.property_type} hosted by
                your host

              </h2>


              <div className="mt-3 flex flex-wrap gap-3 text-gray-600">

                <span>
                  {listing.max_guests} guests
                </span>

                <span>·</span>

                <span>
                  {listing.bedrooms} bedrooms
                </span>

                <span>·</span>

                <span>
                  {listing.beds} beds
                </span>

                <span>·</span>

                <span>
                  {listing.bathrooms} bathrooms
                </span>

              </div>

            </div>


            {/* DESCRIPTION */}

            <div className="border-b py-8">

              <h2 className="text-xl font-semibold">
                About this place
              </h2>

              <p className="mt-4 whitespace-pre-line leading-7 text-gray-600">
                {listing.description}
              </p>

            </div>


            {/* AMENITIES */}

            <div className="border-b py-8">

              <h2 className="text-xl font-semibold">
                What this place offers
              </h2>


              {listing.amenities &&
              listing.amenities.length > 0 ? (

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  {listing.amenities.map(
                    (amenity) => (

                      <div
                        key={amenity.id}
                        className="flex items-center gap-3 text-gray-700"
                      >

                        <Check size={18} />

                        {amenity.name}

                      </div>

                    )
                  )}

                </div>

              ) : (

                <p className="mt-4 text-gray-500">
                  No amenities listed.
                </p>

              )}

            </div>


            {/* =================================================
                REVIEWS
            ================================================== */}

            <section className="border-b py-8">


              <div className="flex items-center gap-3">

                <Star
                  size={22}
                  className="fill-black"
                />

                <h2 className="text-2xl font-semibold">

                  {listing.rating.toFixed(2)}

                  {" · "}

                  {listing.review_count} reviews

                </h2>

              </div>


              {/* REVIEW FORM */}

              <div className="mt-8 rounded-2xl border p-6">

                <h3 className="text-lg font-semibold">
                  Write a review
                </h3>


                <p className="mt-1 text-sm text-gray-500">
                  Share your experience with other guests.
                </p>


                {/* STAR SELECTOR */}

                <div className="mt-5">

                  <p className="mb-2 text-sm font-medium">
                    Your rating
                  </p>


                  <div className="flex gap-2">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (

                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setReviewRating(
                              star
                            )
                          }
                          className="rounded-lg p-1"
                          aria-label={`Rate ${star} stars`}
                        >

                          <Star
                            size={28}
                            className={
                              star <=
                              reviewRating
                                ? "fill-black"
                                : "text-gray-300"
                            }
                          />

                        </button>

                      )
                    )}

                  </div>

                </div>


                {/* COMMENT */}

                <textarea
                  value={reviewComment}
                  onChange={(event) =>
                    setReviewComment(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="What did you like about your stay?"
                  className="mt-5 w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-black"
                />


                {/* REVIEW ERROR */}

                {reviewError && (

                  <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {reviewError}
                  </div>

                )}


                {/* REVIEW SUCCESS */}

                {reviewMessage && (

                  <div className="mt-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                    {reviewMessage}
                  </div>

                )}


                <button
                  type="button"
                  onClick={handleReviewSubmit}
                  disabled={reviewLoading}
                  className="mt-4 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >

                  {reviewLoading
                    ? "Submitting..."
                    : "Submit review"}

                </button>

              </div>


              {/* REVIEWS LIST */}

              <div className="mt-8">

                {reviewsLoading ? (

                  <p className="text-gray-500">
                    Loading reviews...
                  </p>

                ) : reviews.length === 0 ? (

                  <div className="rounded-2xl bg-gray-50 p-8 text-center">

                    <Star
                      size={32}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 font-medium">
                      No reviews yet
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Be the first guest to leave a review.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-6">

                    {reviews.map(
                      (review) => (

                        <div
                          key={review.id}
                          className="border-b pb-6 last:border-0"
                        >

                          <div className="flex items-center gap-3">

                            {review.user
                              ?.avatar_url ? (

                              <img
                                src={
                                  review.user.avatar_url
                                }
                                alt={
                                  review.user.name
                                }
                                className="h-11 w-11 rounded-full object-cover"
                              />

                            ) : (

                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 font-semibold">

                                {review.user?.name
                                  ?.charAt(0)
                                  .toUpperCase() ||
                                  "G"}

                              </div>

                            )}


                            <div>

                              <p className="font-semibold">
                                {review.user?.name ||
                                  "Guest"}
                              </p>

                              <p className="text-xs text-gray-500">

                                {new Date(
                                  review.created_at
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    month:
                                      "short",
                                    year:
                                      "numeric",
                                  }
                                )}

                              </p>

                            </div>

                          </div>


                          {/* STARS */}

                          <div className="mt-3 flex gap-1">

                            {[1, 2, 3, 4, 5].map(
                              (star) => (

                                <Star
                                  key={star}
                                  size={16}
                                  className={
                                    star <=
                                    review.rating
                                      ? "fill-black"
                                      : "text-gray-300"
                                  }
                                />

                              )
                            )}

                          </div>


                          {/* COMMENT */}

                          <p className="mt-3 leading-6 text-gray-700">
                            {review.comment}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </section>

          </div>


          {/* =================================================
              BOOKING CARD
          ================================================== */}

          <div>

            <div className="sticky top-6 rounded-2xl border bg-white p-6 shadow-lg">


              {/* PRICE */}

              <div className="flex items-end justify-between">

                <div>

                  <span className="text-2xl font-bold">

                    ₹
                    {listing.price_per_night.toLocaleString()}

                  </span>

                  <span className="text-gray-500">
                    {" "}night
                  </span>

                </div>


                <div className="flex items-center gap-1 text-sm">

                  <Star
                    size={15}
                    className="fill-black"
                  />

                  {listing.rating.toFixed(2)}

                  {" · "}

                  {listing.review_count}

                </div>

              </div>


              {/* DATES */}

              <div className="mt-6 overflow-hidden rounded-xl border">

                <div className="grid grid-cols-2">

                  <div className="border-r p-3">

                    <label className="flex items-center gap-1 text-xs font-semibold uppercase">

                      <CalendarDays
                        size={14}
                      />

                      Check-in

                    </label>

                    <input
                      type="date"
                      value={checkIn}
                      min={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(event) =>
                        setCheckIn(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full text-sm outline-none"
                    />

                  </div>


                  <div className="p-3">

                    <label className="flex items-center gap-1 text-xs font-semibold uppercase">

                      <CalendarDays
                        size={14}
                      />

                      Check-out

                    </label>

                    <input
                      type="date"
                      value={checkOut}
                      min={
                        checkIn ||
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(event) =>
                        setCheckOut(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full text-sm outline-none"
                    />

                  </div>

                </div>


                {/* GUESTS */}

                <div className="border-t p-3">

                  <label className="flex items-center gap-1 text-xs font-semibold uppercase">

                    <Users size={14} />

                    Guests

                  </label>


                  <select
                    value={guests}
                    onChange={(event) =>
                      setGuests(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="mt-2 w-full bg-transparent text-sm outline-none"
                  >

                    {Array.from(
                      {
                        length:
                          listing.max_guests,
                      },
                      (_, index) => (
                        <option
                          key={index + 1}
                          value={index + 1}
                        >
                          {index + 1}{" "}
                          {index === 0
                            ? "guest"
                            : "guests"}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>


              {/* PRICE BREAKDOWN */}

              {nights > 0 && (

                <div className="mt-5 space-y-3 text-sm">

                  <div className="flex justify-between">

                    <span className="underline">
                      ₹
                      {listing.price_per_night.toLocaleString()}
                      {" × "}
                      {nights} nights
                    </span>

                    <span>
                      ₹
                      {subtotal.toLocaleString()}
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="underline">
                      Cleaning fee
                    </span>

                    <span>
                      ₹
                      {cleaningFee.toLocaleString()}
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="underline">
                      Service fee
                    </span>

                    <span>
                      ₹
                      {serviceFee.toLocaleString()}
                    </span>

                  </div>


                  <div className="flex justify-between border-t pt-3 text-base font-semibold">

                    <span>
                      Total
                    </span>

                    <span>
                      ₹
                      {total.toLocaleString()}
                    </span>

                  </div>

                </div>

              )}


              {/* BOOKING ERROR */}

              {bookingError && (

                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {bookingError}
                </div>

              )}


              {/* BOOKING SUCCESS */}

              {bookingMessage && (

                <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {bookingMessage}
                </div>

              )}


              {/* RESERVE */}

              <button
                onClick={handleBooking}
                disabled={
                  bookingLoading ||
                  !checkIn ||
                  !checkOut
                }
                className="mt-5 w-full rounded-xl bg-rose-500 py-4 font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {bookingLoading
                  ? "Checking availability..."
                  : "Reserve"}

              </button>


              <p className="mt-3 text-center text-xs text-gray-500">
                You won't be charged yet
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>

  );
}
