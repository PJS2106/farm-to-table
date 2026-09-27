# FARM TO TABLE

**Farm-to-Table AI Marketplace and Decision-Support Platform**

FARM TO TABLE is a web application that connects local farmers and consumers through a transparent digital marketplace. The platform allows farmers to list fresh produce, while consumers can discover nearby products, compare prices, and send purchase requests. It also includes a simple AI-assisted price recommendation feature based on previous market prices.

## Features

* Farmer and Consumer authentication using Supabase
* Farmer dashboard for managing produce listings
* Consumer marketplace with search, filter, and sorting
* Add, edit, and delete produce listings (CRUD)
* Purchase request system
* AI-assisted price suggestions
* Responsive design for mobile and desktop

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* Supabase

## Project Structure

`src/` – Application source code

`public/` – Static assets

`supabase/` – Database configuration and SQL

`components/` – Reusable UI components

## Local Development

### Prerequisites

* Node.js (18 or later)
* npm

### Installation

```bash
git clone https://github.com/PJS2106/earthly-bazaar.git
cd earthly-bazaar
npm install
npm run dev
```

The development server will start at `http://localhost:5173`.

## Future Enhancements

* Real-time farmer notifications
* Image upload for produce
* Order tracking
* Delivery partner integration
* Advanced AI price prediction
* Multi-language support
* Payment gateway integration
