# ClickTik Products

A modern Angular product exploration app built as an Angular technical task.

The app allows users to sign in, browse paginated products, search products, filter by category, and add products to a cart badge using the DummyJSON APIs.

## Repository

https://github.com/MahmoudMo99/clicktik-products

## Demo Credentials

Use the following DummyJSON demo account to sign in:

```text
Username: emilys
Password: emilyspass
```

## Features

- Login using DummyJSON Auth API
- Protected products page using a functional route guard
- Guest guard to redirect authenticated users away from the login page
- Product listing with page-based pagination
- Product search with debounced input
- Category filtering with product counts
- URL-driven state for page, search, and category
- Add product to cart using DummyJSON Cart API
- Cart badge showing the number of added products
- Optimistic cart update with rollback on API failure
- Loading skeletons, empty states, and error states
- Responsive layout for desktop, tablet, and mobile

## Tech Stack

- Angular 21
- Standalone Components
- Zoneless Change Detection
- Angular Signals
- RxJS
- TypeScript
- SCSS
- DummyJSON API

## Angular Features Used

- `provideZonelessChangeDetection()`
- `provideHttpClient(withFetch())`
- Functional HTTP interceptor
- Functional route guards
- Lazy-loaded standalone components with `loadComponent`
- `withComponentInputBinding()`
- `withInMemoryScrolling()`
- `signal`, `computed`, `linkedSignal`
- `input()`, `input.required()`, `output()`
- `toSignal()` and `toObservable()`
- Built-in control flow: `@if`, `@for`, `@switch`, `@empty`, `@let`

## Project Structure

```text
src/app
├── core
│   ├── auth
│   ├── cart
│   ├── guards
│   ├── http
│   ├── models
│   ├── products
│   └── routing
│
├── features
│   ├── login
│   └── products
│       ├── models
│       ├── products
│       └── utils
│
└── shared
    └── ui
        ├── button
        ├── cart-badge
        ├── empty-state
        ├── footer
        ├── header
        ├── input
        ├── layout
        ├── pagination
        ├── product-card
        ├── product-skeleton
        └── select
```

## Architecture Notes

### Authentication

Authentication is handled by `AuthService` using Angular signals for session state.

The app stores the authenticated session in `localStorage` and exposes derived state using computed signals:

- `user`
- `accessToken`
- `refreshToken`
- `isAuthenticated`

A functional HTTP interceptor attaches the access token to API requests and attempts to refresh the token when a protected API request returns `401`.

### Routing

The app uses two functional guards:

- `authGuard` protects the products page.
- `guestGuard` redirects authenticated users away from the login page.

The products page uses URL query parameters as the source of truth:

```text
/products?page=1
/products?category=smartphones&page=1
/products?search=phone&page=1
```

This keeps pagination, search, and category filtering shareable and browser-friendly.

### Products State

The products page combines Angular signals and RxJS:

- `queryParamMap` is converted into a typed products query.
- `switchMap` cancels stale product requests when query params change.
- `toSignal()` exposes the async products state to the template.
- The template handles loading, success, error, and empty states.

### Search

The header search uses `linkedSignal()` to stay in sync with the current URL search parameter.

Search input changes are converted to an observable with `toObservable()`, debounced using RxJS, and written back to the route query params.

### Cart

DummyJSON cart APIs are simulated and do not persist a real user cart for this task.

The app keeps a lightweight signal-based cart quantity state for the cart badge, while still sending the add-to-cart request to the API.

The cart update is optimistic:

- Badge updates immediately.
- API request is sent.
- On success, local state syncs with the API response.
- On failure, local state rolls back.

### Design System

The UI is built using shared SCSS design tokens and reusable UI components.

Global tokens define:

- colors
- typography
- spacing
- border radius
- shadows
- layout sizes
- product card dimensions
- form controls
- pagination
- focus rings

Reusable UI components include:

- Button
- Input
- Select
- Product Card
- Pagination
- Cart Badge
- Loading Skeleton
- Empty State
- Header
- Footer
- Layout

## API Endpoints

The app uses DummyJSON APIs:

```text
POST /auth/login
POST /auth/refresh
GET  /products
GET  /products/search
GET  /products/category/{category}
GET  /products/categories
POST /carts/add
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MahmoudMo99/clicktik-products.git
cd clicktik-products
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm start
```

Then open:

```text
http://localhost:4200
```

### 4. Build

```bash
npm run build
```

### 5. Run tests

```bash
npm test
```

## Notes

- The login form uses the `username` field internally because DummyJSON Auth expects a username, even though the UI label follows the provided design.
- Category counts are calculated by requesting each category with `limit=1` and reading the `total` field.
- Product review counts are displayed dynamically using the product `reviews` array length.
- The cart badge displays the number of added products only, as required by the task.
- The app uses route scroll restoration so pagination and navigation return the user to the top of the page.
