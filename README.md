# Airbnb Clone

A full-stack Airbnb-style accommodation booking platform built as an SDE assignment using Next.js, TypeScript, FastAPI, SQLite, and Tailwind CSS.

## 🚀 Live Demo

Frontend: Coming soon

Backend API: Coming soon

## 📌 Project Overview

This project recreates the core experience of an Airbnb-style platform. Users can browse stays, search by location, filter listings, view listing details, check availability, make bookings, manage trips, save favorites, receive notifications, and submit reviews.

Hosts can manage their properties through a dedicated dashboard with create, read, update, and delete functionality.

## ✨ Features

### Guest Features

- Browse available properties
- Search listings by location
- Filter listings by property category
- View detailed property pages
- Photo galleries
- View property amenities
- View ratings and reviews
- Select check-in and check-out dates
- Check listing availability
- Select number of guests
- Calculate booking price
- Create bookings
- View upcoming and previous trips
- Add and remove favorites
- Submit listing reviews
- View notifications
- Mark notifications as read
- Delete notifications

### Host Features

- Host dashboard
- View hosted properties
- Create new listings
- Edit existing listings
- Delete listings
- Add property images
- Add amenities
- View basic listing statistics

## 🛠️ Tech Stack

### Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Lucide React

### Backend

- Python
- FastAPI
- SQLModel
- SQLite
- Uvicorn

### Development Tools

- Git
- GitHub
- VS Code
- REST API
- Swagger / OpenAPI

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │     Next.js UI      │
                    │  React + TypeScript │
                    └──────────┬──────────┘
                               │
                         REST API Calls
                               │
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI Backend  │
                    │      Python API     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      SQLModel       │
                    │     ORM / Models    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       SQLite        │
                    │      Database       │
                    └─────────────────────┘
