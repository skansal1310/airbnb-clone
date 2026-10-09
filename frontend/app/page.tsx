"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Home,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createListing,
  deleteListing,
  getListing,
  getListings,
  updateListing,
} from "@/lib/api";

import { Listing } from "@/lib/types";


// ---------------------------------------------------------
// DEMO HOST
// ---------------------------------------------------------

const HOST_ID = 1;


// ---------------------------------------------------------
// DEFAULT FORM
// ---------------------------------------------------------

const emptyForm = {
  title: "",
  description: "",
  property_type: "Apartment",
  location: "",
  country: "India",
  price_per_night: 0,
  max_guests: 1,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  image_urls: "",
  amenities: "",
};


// ---------------------------------------------------------
// PAGE
// ---------------------------------------------------------

export default function HostDashboard() {

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [deletingId, setDeletingId] = useState<number | null>(null);


  // -------------------------------------------------------
  // LOAD HOST LISTINGS
  // -------------------------------------------------------

  async function loadListings() {

    try {

      setLoading(true);

      const data = await getListings({
        host_id: HOST_ID,
        limit: 50,
      });

      setListings(data);

    } catch (error) {

      console.error(error);

      setError("Failed to load your listings.");

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {

    loadListings();

  }, []);


  // -------------------------------------------------------
  // OPEN ADD FORM
  // -------------------------------------------------------

  function openAddForm() {

    setEditingId(null);

    setForm(emptyForm);

    setError("");

    setSuccess("");

    setShowForm(true);
  }


  // -------------------------------------------------------
  // OPEN EDIT FORM
  // -------------------------------------------------------

  async function openEditForm(listingId: number) {

    try {

      setError("");

      setSuccess("");

      const listing = await getListing(listingId);


      const imageUrls =
        listing.images
          ?.map((image: { url: string }) => image.url)
          .join("\n") || "";


      const amenityNames =
        listing.amenities
          ?.map((amenity: { name: string }) => amenity.name)
          .join(", ") || "";


      setForm({

        title: listing.title || "",

        description:
          listing.description || "",

        property_type:
          listing.property_type || "Apartment",

        location:
          listing.location || "",

        country:
          listing.country || "India",

        price_per_night:
          listing.price_per_night || 0,

        max_guests:
          listing.max_guests || 1,

        bedrooms:
          listing.bedrooms || 1,

        beds:
          listing.beds || 1,

        bathrooms:
          listing.bathrooms || 1,

        image_urls:
          imageUrls,

        amenities:
          amenityNames,

      });


      setEditingId(listingId);

      setShowForm(true);

    } catch (error) {

      console.error(error);

      setError(
        "Failed to load listing details."
      );

    }
  }


  // -------------------------------------------------------
  // CLOSE FORM
  // -------------------------------------------------------

  function closeForm() {

    if (saving) {
      return;
    }

    setShowForm(false);

    setEditingId(null);

    setForm(emptyForm);

    setError("");

  }


  // -------------------------------------------------------
  // HANDLE FORM INPUT
  // -------------------------------------------------------

  function handleChange(
    field: string,
    value: string | number
  ) {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

  }


  // -------------------------------------------------------
  // SAVE LISTING
  // -------------------------------------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");

    setSuccess("");

    if (!form.title.trim()) {

      setError(
        "Please enter a listing title."
      );

      return;
    }

    if (!form.location.trim()) {

      setError(
        "Please enter a location."
      );

      return;
    }

    if (form.price_per_night <= 0) {

      setError(
        "Price must be greater than 0."
      );

      return;
    }


    const imageUrls = form.image_urls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);


    const amenities = form.amenities
      .split(",")
      .map((amenity) => amenity.trim())
      .filter(Boolean);


    const payload = {

      title: form.title.trim(),

      description:
        form.description.trim(),

      property_type:
        form.property_type,

      location:
        form.location.trim(),

      country:
        form.country.trim(),

      price_per_night:
        Number(form.price_per_night),

      max_guests:
        Number(form.max_guests),

      bedrooms:
        Number(form.bedrooms),

      beds:
        Number(form.beds),

      bathrooms:
        Number(form.bathrooms),

      image_urls:
        imageUrls,

      amenities:
        amenities,

    };


    try {

      setSaving(true);


      // -----------------------------------------------
      // UPDATE
      // -----------------------------------------------

      if (editingId !== null) {

        await updateListing(
          editingId,
          payload
        );

        setSuccess(
          "Listing updated successfully!"
        );

      }

      // -----------------------------------------------
      // CREATE
      // -----------------------------------------------

      else {

        await createListing({

          host_id: HOST_ID,

          ...payload,

        });

        setSuccess(
          "Listing created successfully!"
        );

      }


      await loadListings();


      setTimeout(() => {

        setShowForm(false);

        setEditingId(null);

        setForm(emptyForm);

        setSuccess("");

      }, 700);


    } catch (error) {

      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    } finally {

      setSaving(false);

    }

  }


  // -------------------------------------------------------
  // DELETE LISTING
  // -------------------------------------------------------

  async function handleDelete(
    listingId: number
  ) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this listing? This action cannot be undone."
      );

    if (!confirmed) {
      return;
    }


    try {

      setDeletingId(listingId);

      setError("");

      await deleteListing(listingId);

      setListings((previous) =>
        previous.filter(
          (listing) =>
            listing.id !== listingId
        )
      );

      setSuccess(
        "Listing deleted successfully."
      );


      setTimeout(() => {
        setSuccess("");
      }, 2500);


    } catch (error) {

      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete listing."
      );

    } finally {

      setDeletingId(null);

    }

  }


  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  return (

    <main className="min-h-screen bg-gray-50">

      {/* -------------------------------------------------
          HEADER
      -------------------------------------------------- */}

      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-4">

            <Link
              href="/"
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </Link>


            <div>

              <div className="flex items-center gap-2">

                <Home
                  size={22}
                  className="text-rose-500"
                />

                <h1 className="text-2xl font-bold">
                  Host Dashboard
                </h1>

              </div>

              <p className="mt-1 text-sm text-gray-500">
                Manage your properties and listings
              </p>

            </div>

          </div>


          <button
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >

            <Plus size={18} />

            Add listing

          </button>

        </div>

      </header>


      {/* -------------------------------------------------
          MAIN CONTENT
      -------------------------------------------------- */}

      <div className="mx-auto max-w-7xl px-6 py-8">


        {/* SUCCESS MESSAGE */}

        {success && (

          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

            {success}

          </div>

        )}


        {/* ERROR MESSAGE */}

        {error && (

          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            {error}

          </div>

        )}


        {/* -------------------------------------------------
            STATS
        -------------------------------------------------- */}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Total listings
            </p>

            <p className="mt-2 text-3xl font-bold">
              {listings.length}
            </p>

          </div>


          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Average price
            </p>

            <p className="mt-2 text-3xl font-bold">

              ₹
              {listings.length
                ? Math.round(
                    listings.reduce(
                      (sum, listing) =>
                        sum +
                        listing.price_per_night,
                      0
                    ) / listings.length
                  ).toLocaleString()
                : 0}

            </p>

            <p className="mt-1 text-xs text-gray-400">
              per night
            </p>

          </div>


          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Highest rated
            </p>

            <p className="mt-2 text-3xl font-bold">

              ⭐
              {listings.length
                ? Math.max(
                    ...listings.map(
                      (listing) =>
                        listing.rating
                    )
                  ).toFixed(2)
                : "0.00"}

            </p>

          </div>

        </div>


        {/* -------------------------------------------------
            LISTINGS
        -------------------------------------------------- */}

        <div className="mb-5 flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold">
              Your listings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage your properties
            </p>

          </div>

        </div>


        {loading ? (

          <div className="flex min-h-[300px] items-center justify-center">

            <p className="text-gray-500">
              Loading your listings...
            </p>

          </div>

        ) : listings.length === 0 ? (

          <div className="rounded-2xl border border-dashed bg-white px-6 py-16 text-center">

            <Home
              size={42}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-4 text-lg font-semibold">
              You don't have any listings yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Create your first property and start hosting.
            </p>

            <button
              onClick={openAddForm}
              className="mt-5 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              Add your first listing
            </button>

          </div>

        ) : (

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {listings.map((listing) => (

              <div
                key={listing.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >

                {/* IMAGE */}

                <div className="relative aspect-[4/3] bg-gray-100">

                  {listing.images &&
                  listing.images.length > 0 ? (

                    <img
                      src={listing.images[0].url}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    <div className="flex h-full items-center justify-center text-gray-400">
                      No image
                    </div>

                  )}

                </div>


                {/* DETAILS */}

                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <h3 className="font-semibold">
                        {listing.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {listing.location},{" "}
                        {listing.country}
                      </p>

                    </div>


                    <div className="flex items-center gap-1 text-sm">

                      <span>
                        ★
                      </span>

                      <span>
                        {listing.rating.toFixed(2)}
                      </span>

                    </div>

                  </div>


                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">

                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      {listing.property_type}
                    </span>

                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      {listing.max_guests} guests
                    </span>

                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      {listing.bedrooms} bedrooms
                    </span>

                  </div>


                  <div className="mt-5">

                    <span className="text-lg font-bold">
                      ₹
                      {listing.price_per_night.toLocaleString()}
                    </span>

                    <span className="text-sm text-gray-500">
                      {" "}night
                    </span>

                  </div>


                  {/* ACTIONS */}

                  <div className="mt-5 grid grid-cols-3 gap-2">

                    <Link
                      href={`/listings/${listing.id}`}
                      className="flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >

                      <ExternalLink size={15} />

                      View

                    </Link>


                    <button
                      onClick={() =>
                        openEditForm(
                          listing.id
                        )
                      }
                      className="flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >

                      <Edit size={15} />

                      Edit

                    </button>


                    <button
                      onClick={() =>
                        handleDelete(
                          listing.id
                        )
                      }
                      disabled={
                        deletingId ===
                        listing.id
                      }
                      className="flex items-center justify-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >

                      <Trash2 size={15} />

                      {deletingId ===
                      listing.id
                        ? "..."
                        : "Delete"}

                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* =================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">

          <div className="mx-auto my-8 max-w-3xl rounded-3xl bg-white shadow-2xl">


            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>

                <h2 className="text-xl font-bold">

                  {editingId !== null
                    ? "Edit listing"
                    : "Add a new listing"}

                </h2>

                <p className="mt-1 text-sm text-gray-500">

                  {editingId !== null
                    ? "Update your property details."
                    : "Tell guests about your property."}

                </p>

              </div>


              <button
                onClick={closeForm}
                className="rounded-full p-2 hover:bg-gray-100"
              >

                <X size={20} />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >


              {/* BASIC INFO */}

              <section>

                <h3 className="mb-4 font-semibold">
                  Basic information
                </h3>

                <div className="grid gap-4">


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Listing title *
                    </label>

                    <input
                      value={form.title}
                      onChange={(event) =>
                        handleChange(
                          "title",
                          event.target.value
                        )
                      }
                      placeholder="Beautiful beach villa"
                      className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Description
                    </label>

                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        handleChange(
                          "description",
                          event.target.value
                        )
                      }
                      rows={4}
                      placeholder="Describe your property..."
                      className="w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-black"
                    />

                  </div>


                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        Property type
                      </label>

                      <select
                        value={form.property_type}
                        onChange={(event) =>
                          handleChange(
                            "property_type",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border px-4 py-3"
                      >

                        <option value="Apartment">
                          Apartment
                        </option>

                        <option value="House">
                          House
                        </option>

                        <option value="Villa">
                          Villa
                        </option>

                        <option value="Cabin">
                          Cabin
                        </option>

                        <option value="Hotel">
                          Hotel
                        </option>

                        <option value="Guesthouse">
                          Guesthouse
                        </option>

                      </select>

                    </div>


                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        Country
                      </label>

                      <input
                        value={form.country}
                        onChange={(event) =>
                          handleChange(
                            "country",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border px-4 py-3"
                      />

                    </div>

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Location *
                    </label>

                    <input
                      value={form.location}
                      onChange={(event) =>
                        handleChange(
                          "location",
                          event.target.value
                        )
                      }
                      placeholder="Goa"
                      className="w-full rounded-xl border px-4 py-3"
                    />

                  </div>

                </div>

              </section>


              {/* PROPERTY DETAILS */}

              <section className="border-t pt-6">

                <h3 className="mb-4 font-semibold">
                  Property details
                </h3>


                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Price / night
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={form.price_per_night}
                      onChange={(event) =>
                        handleChange(
                          "price_per_night",
                          Number(event.target.value)
                        )
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Max guests
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={form.max_guests}
                      onChange={(event) =>
                        handleChange(
                          "max_guests",
                          Number(event.target.value)
                        )
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Bedrooms
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={form.bedrooms}
                      onChange={(event) =>
                        handleChange(
                          "bedrooms",
                          Number(event.target.value)
                        )
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Beds
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={form.beds}
                      onChange={(event) =>
                        handleChange(
                          "beds",
                          Number(event.target.value)
                        )
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Bathrooms
                    </label>

                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={form.bathrooms}
                      onChange={(event) =>
                        handleChange(
                          "bathrooms",
                          Number(event.target.value)
                        )
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    />

                  </div>

                </div>

              </section>


              {/* IMAGES */}

              <section className="border-t pt-6">

                <h3 className="mb-2 font-semibold">
                  Photos
                </h3>

                <p className="mb-4 text-sm text-gray-500">
                  Add one image URL per line.
                </p>


                <textarea
                  value={form.image_urls}
                  onChange={(event) =>
                    handleChange(
                      "image_urls",
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder={
                    "https://images.unsplash.com/photo-example-1\nhttps://images.unsplash.com/photo-example-2"
                  }
                  className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:border-black"
                />

              </section>


              {/* AMENITIES */}

              <section className="border-t pt-6">

                <h3 className="mb-2 font-semibold">
                  Amenities
                </h3>

                <p className="mb-4 text-sm text-gray-500">
                  Separate amenities with commas.
                </p>


                <input
                  value={form.amenities}
                  onChange={(event) =>
                    handleChange(
                      "amenities",
                      event.target.value
                    )
                  }
                  placeholder="WiFi, Pool, Kitchen, Parking, Air Conditioning"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                />

              </section>


              {/* ERROR */}

              {error && (

                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>

              )}


              {/* SUCCESS */}

              {success && (

                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
                  {success}
                </div>

              )}


              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t pt-6">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-full border px-5 py-3 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >

                  {saving
                    ? "Saving..."
                    : editingId !== null
                    ? "Save changes"
                    : "Create listing"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}