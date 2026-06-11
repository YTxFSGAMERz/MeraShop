# API Documentation

Complete reference for all MeraShop API endpoints. All endpoints return JSON and follow REST conventions.

**Base URL**: `http://localhost:3000/api`

---

## Table of Contents

- [Products](#products)
- [Categories](#categories)
- [Banners](#banners)
- [Search](#search)
- [Auth](#auth)
- [Orders](#orders)
- [Addresses](#addresses)
- [Reviews](#reviews)
- [Questions](#questions)
- [Coupons](#coupons)
- [Payment](#payment)
- [Newsletter](#newsletter)
- [Analytics](#analytics)
- [Blog](#blog)
- [FAQ](#faq)
- [Contact](#contact)
- [Stock Alerts](#stock-alerts)
- [AI](#ai)
- [Admin — Products](#admin--products)
- [Admin — Orders](#admin--orders)
- [Admin — Users](#admin--users)
- [Admin — Categories](#admin--categories)
- [Admin — Coupons](#admin--coupons)
- [Admin — Banners](#admin--banners)
- [Admin — Blog](#admin--blog)
- [Admin — Dashboard](#admin--dashboard)

---

## Products

### List Products

```
GET /api/products
```

Returns a paginated list of active products with filtering, sorting, and full relation data.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | — | Filter by category slug |
| `brand` | string | — | Filter by brand slug |
| `search` | string | — | Search in name, description, tags, SKU |
| `sort` | string | `newest` | Sort order: `newest`, `price_asc`, `price_desc`, `rating`, `bestseller` |
| `page` | number | `1` | Page number (≥ 1) |
| `limit` | number | `12` | Items per page (1–100) |
| `featured` | string | — | Set to `true` for featured products only |
| `newArrival` | string | — | Set to `true` for new arrivals only |
| `bestseller` | string | — | Set to `true` for bestsellers only |

**Response** `200`:

```json
{
  "products": [
    {
      "id": "clx...",
      "name": "Samsung Galaxy S24 Ultra",
      "slug": "samsung-galaxy-s24-ultra",
      "shortDescription": "Flagship smartphone with AI features",
      "basePrice": 129999,
      "salePrice": 109999,
      "effectivePrice": 109999,
      "discountPercent": 15,
      "primaryImage": "https://...",
      "primaryImageAlt": "Samsung Galaxy S24 Ultra",
      "category": { "id": "clx", "name": "Electronics", "slug": "electronics" },
      "brand": { "id": "clx", "name": "Samsung", "slug": "samsung", "logo": null },
      "variants": [{ "id": "clx", "name": "Color", "value": "Titanium Gray", "price": null, "stock": 15 }],
      "avgRating": 4.5,
      "reviewCount": 42,
      "totalSold": 150,
      "isFeatured": true,
      "isNewArrival": false,
      "isBestseller": true,
      "stock": 25,
      "shippingFree": true,
      "tags": "smartphone,samsung,5g",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 13
}
```

**Error** `500`:

```json
{ "error": "Failed to fetch products" }
```

---

### Get Product by Slug

```
GET /api/products/[slug]
```

Returns full product details including images, variants, reviews, and review distribution.

**Response** `200`:

```json
{
  "product": {
    "id": "clx...",
    "name": "Samsung Galaxy S24 Ultra",
    "slug": "samsung-galaxy-s24-ultra",
    "description": "Full product description...",
    "shortDescription": "Flagship smartphone with AI features",
    "basePrice": 129999,
    "salePrice": 109999,
    "effectivePrice": 109999,
    "discountPercent": 15,
    "primaryImage": "https://...",
    "primaryImageAlt": "Samsung Galaxy S24 Ultra",
    "category": {
      "id": "clx", "name": "Electronics", "slug": "electronics",
      "parentId": null, "parent": null
    },
    "brand": { "id": "clx", "name": "Samsung", "slug": "samsung", "logo": null, "description": "..." },
    "images": [
      { "id": "clx", "url": "https://...", "altText": "...", "sortOrder": 0, "isPrimary": true }
    ],
    "variants": [
      { "id": "clx", "name": "Color", "value": "Titanium Gray", "sku": "SG24-TG", "price": null, "stock": 15, "isActive": true }
    ],
    "variantGroups": {
      "Color": [{ "id": "clx", "value": "Titanium Gray", "price": null, "stock": 15 }],
      "Storage": [{ "id": "cly", "value": "256GB", "price": null, "stock": 10 }]
    },
    "reviews": [
      {
        "id": "clx", "rating": 5, "title": "Amazing phone!", "comment": "...",
        "isVerified": true, "isActive": true, "createdAt": "...",
        "user": { "id": "clx", "name": "Rahul S.", "avatar": null }
      }
    ],
    "reviewDistribution": { "1": 2, "2": 1, "3": 5, "4": 12, "5": 22 },
    "avgRating": 4.5,
    "reviewCount": 42,
    "totalSold": 150,
    "isFeatured": true,
    "isNewArrival": false,
    "isBestseller": true,
    "stock": 25,
    "lowStockThreshold": 10,
    "shippingFree": true,
    "returnPolicy": "15 days",
    "tags": ["smartphone", "samsung", "5g"],
    "specifications": { "Display": "6.8 inch", "Battery": "5000 mAh" },
    "sku": "SG24-ULTRA",
    "weight": 232,
    "dimensions": "{\"length\":162.3,\"width\":79,\"height\":8.6}",
    "seoTitle": "Samsung Galaxy S24 Ultra - Buy Online",
    "seoDescription": "Buy Samsung Galaxy S24 Ultra at best price...",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-20T15:30:00.000Z"
  }
}
```

**Error** `404`:

```json
{ "error": "Product not found" }
```

---

### Compare Products

```
GET /api/products/compare?ids=id1,id2,id3,id4
```

Returns product details for side-by-side comparison. Maximum 4 products.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ids` | string | Yes | Comma-separated product IDs (max 4) |

**Response** `200`:

```json
{
  "products": [
    {
      "id": "clx",
      "name": "Product A",
      "slug": "product-a",
      "description": "...",
      "basePrice": 19999,
      "salePrice": 14999,
      "effectivePrice": 14999,
      "discountPercent": 25,
      "primaryImage": "https://...",
      "category": { "id": "clx", "name": "Electronics", "slug": "electronics" },
      "brand": { "id": "clx", "name": "Brand", "slug": "brand" },
      "variantGroups": { "Color": [...] },
      "specifications": { "RAM": "8GB", "Storage": "128GB" },
      "tags": ["tag1", "tag2"],
      "avgRating": 4.2,
      "reviewCount": 30,
      "stock": 15,
      "shippingFree": false,
      "returnPolicy": "7 days"
    }
  ]
}
```

---

## Categories

### List Categories

```
GET /api/categories
```

Returns hierarchical category tree with product counts.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `includeProducts` | string | `false` | Set to `true` to include top 4 products per category |

**Response** `200`:

```json
{
  "categories": [
    {
      "id": "clx",
      "name": "Electronics",
      "slug": "electronics",
      "description": "...",
      "image": "https://...",
      "parentId": null,
      "sortOrder": 0,
      "isActive": true,
      "children": [
        {
          "id": "cly",
          "name": "Smartphones",
          "slug": "smartphones",
          "description": "...",
          "image": null,
          "sortOrder": 0,
          "parentId": "clx",
          "_count": { "products": 25 }
        }
      ],
      "_count": { "products": 50 },
      "products": [ ... ]
    }
  ]
}
```

---

### Get Category by Slug

```
GET /api/categories/[slug]
```

Returns category details with children and product counts.

**Response** `200`:

```json
{
  "category": {
    "id": "clx",
    "name": "Electronics",
    "slug": "electronics",
    "description": "Gadgets, devices & more",
    "image": "https://...",
    "parentId": null,
    "parent": null,
    "children": [
      { "id": "cly", "name": "Smartphones", "slug": "smartphones", "productCount": 25 }
    ],
    "directProductCount": 50,
    "totalProductCount": 75
  }
}
```

**Error** `404`: `{ "error": "Category not found" }`

---

## Banners

### List Banners

```
GET /api/banners
```

Returns active banners filtered by position and date validity.

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `position` | string | Filter by position: `hero`, `category`, `sidebar`, `popup` |

**Response** `200`:

```json
{
  "banners": [
    {
      "id": "clx",
      "title": "Grand Indian Sale!",
      "subtitle": "Up to 70% off",
      "image": "https://...",
      "linkUrl": "/shop?sale=true",
      "linkText": "Shop Now",
      "position": "hero",
      "sortOrder": 0,
      "isActive": true,
      "startsAt": null,
      "expiresAt": "2025-12-31T23:59:59.000Z"
    }
  ]
}
```

---

## Search

### Search Products & Categories

```
GET /api/search?q=query&type=all
```

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | — | Search query (min 2 characters) |
| `type` | string | `all` | Search scope: `all`, `products`, `categories` |

**Response** `200`:

```json
{
  "products": [
    {
      "id": "clx",
      "name": "Samsung Galaxy S24",
      "slug": "samsung-galaxy-s24",
      "shortDescription": "...",
      "basePrice": 79999,
      "salePrice": 64999,
      "effectivePrice": 64999,
      "discountPercent": 19,
      "primaryImage": "https://...",
      "category": { "id": "clx", "name": "Electronics", "slug": "electronics" },
      "brand": { "id": "clx", "name": "Samsung", "slug": "samsung" },
      "avgRating": 4.3,
      "reviewCount": 28,
      "stock": 15,
      "shippingFree": true
    }
  ],
  "categories": [
    {
      "id": "clx",
      "name": "Electronics",
      "slug": "electronics",
      "description": "...",
      "image": null,
      "parentId": null,
      "productCount": 50
    }
  ],
  "query": "samsung"
}
```

---

## Auth

### Login

```
POST /api/auth/login
```

**Request Body**:

```json
{
  "email": "customer@merashop.in",
  "password": "any-password"
}
```

> **Note**: Demo mode — any password works. In production, implement proper password hashing.

**Response** `200`:

```json
{
  "user": {
    "id": "clx...",
    "email": "customer@merashop.in",
    "name": "Rahul Sharma",
    "phone": "+919876543210",
    "avatar": null,
    "role": "customer"
  },
  "message": "Login successful"
}
```

**Error** `400`: `{ "error": "Email and password are required" }`

**Error** `401`: `{ "error": "Invalid email or password" }`

**Error** `403`: `{ "error": "Account is deactivated. Please contact support." }`

---

### Register

```
POST /api/auth/register
```

**Request Body**:

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "password": "securepassword"
}
```

**Validation**:
- `name`: Required, non-empty
- `email`: Required, unique
- `password`: Required, minimum 6 characters
- `phone`: Optional, must be unique if provided

**Response** `201`:

```json
{
  "user": {
    "id": "clx...",
    "email": "rahul@example.com",
    "name": "Rahul Sharma",
    "phone": "+919876543210",
    "avatar": null,
    "role": "customer"
  },
  "message": "Account created successfully"
}
```

**Error** `409`: `{ "error": "An account with this email already exists" }`

---

### Get User Profile

```
GET /api/auth/profile?userId=clx...
```

**Response** `200`:

```json
{
  "user": {
    "id": "clx...",
    "email": "customer@merashop.in",
    "name": "Rahul Sharma",
    "phone": "+919876543210",
    "avatar": null,
    "role": "customer",
    "emailVerified": false,
    "phoneVerified": false,
    "createdAt": "2025-01-15T10:00:00.000Z"
  },
  "stats": {
    "orders": 5,
    "wishlist": 3,
    "reviews": 2,
    "addresses": 2
  },
  "addresses": [ ... ]
}
```

---

### Update User Profile

```
PUT /api/auth/profile
```

**Request Body**:

```json
{
  "userId": "clx...",
  "name": "Rahul S.",
  "phone": "+919876543211",
  "avatar": "https://..."
}
```

**Response** `200`:

```json
{
  "user": {
    "id": "clx...",
    "email": "customer@merashop.in",
    "name": "Rahul S.",
    "phone": "+919876543211",
    "avatar": "https://...",
    "role": "customer"
  },
  "message": "Profile updated successfully"
}
```

---

## Orders

### Create Order

```
POST /api/orders
```

**Request Body**:

```json
{
  "shippingAddress": {
    "fullName": "Rahul Sharma",
    "phone": "+919876543210",
    "addressLine1": "123 MG Road",
    "addressLine2": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "paymentMethod": "upi",
  "couponCode": "WELCOME10",
  "items": [
    {
      "productId": "clx...",
      "quantity": 2,
      "variantId": "cly...",
      "variantName": "Color: Titanium Gray",
      "unitPrice": 109999,
      "totalPrice": 219998
    }
  ],
  "subtotal": 219998,
  "shippingCost": 0,
  "discountAmount": 0,
  "totalAmount": 219998
}
```

**Response** `201`:

```json
{
  "order": {
    "id": "clx...",
    "orderNumber": "MSLZ3K5ABC",
    "status": "confirmed",
    "totalAmount": 197998.2,
    "subtotal": 219998,
    "shippingCost": 0,
    "discountAmount": 21999.8,
    "shippingName": "Rahul Sharma",
    "shippingPhone": "+919876543210",
    "shippingAddress1": "123 MG Road",
    "shippingAddress2": "Apt 4B",
    "shippingCity": "Mumbai",
    "shippingState": "Maharashtra",
    "shippingPincode": "400001",
    "estimatedDelivery": "2025-03-10",
    "items": [ ... ],
    "createdAt": "2025-03-05T10:00:00.000Z"
  }
}
```

---

### Get Order by Order Number

```
GET /api/orders?orderNumber=MSLZ3K5ABC
```

**Response** `200`:

```json
{
  "order": {
    "id": "clx...",
    "orderNumber": "MSLZ3K5ABC",
    "status": "confirmed",
    "items": [ ... ],
    "payment": {
      "id": "clx...",
      "status": "completed",
      "method": "upi",
      "amount": 197998.2,
      "currency": "INR"
    }
  }
}
```

---

### Get User Orders

```
GET /api/orders/user?userId=clx...
```

**Response** `200`:

```json
{
  "orders": [
    {
      "id": "clx...",
      "orderNumber": "MSLZ3K5ABC",
      "status": "delivered",
      "subtotal": 219998,
      "shippingCost": 0,
      "discountAmount": 21999.8,
      "taxAmount": 0,
      "totalAmount": 197998.2,
      "couponCode": "WELCOME10",
      "estimatedDelivery": "2025-03-10",
      "deliveredAt": "2025-03-09T14:30:00.000Z",
      "trackingNumber": "DTDC123456",
      "trackingUrl": "https://...",
      "createdAt": "2025-03-05T10:00:00.000Z",
      "shipping": {
        "name": "Rahul Sharma",
        "phone": "+919876543210",
        "address1": "123 MG Road",
        "address2": "Apt 4B",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "country": "India"
      },
      "items": [ ... ],
      "payment": { "id": "clx", "status": "completed", "method": "upi", "amount": 197998.2, "currency": "INR" }
    }
  ]
}
```

---

## Addresses

### List Addresses

```
GET /api/addresses?userId=clx...
```

**Response** `200`:

```json
{
  "addresses": [
    {
      "id": "clx...",
      "userId": "clx...",
      "label": "Home",
      "name": "Rahul Sharma",
      "phone": "+919876543210",
      "addressLine1": "123 MG Road",
      "addressLine2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India",
      "isDefault": true,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### Create Address

```
POST /api/addresses
```

**Request Body**:

```json
{
  "userId": "clx...",
  "label": "Office",
  "name": "Rahul Sharma",
  "phone": "+919876543210",
  "addressLine1": "456 Bandra Kurla Complex",
  "addressLine2": "Tower B, Floor 12",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400051",
  "isDefault": false
}
```

**Response** `201`: `{ "address": { ... } }`

---

### Update Address

```
PUT /api/addresses
```

**Request Body**: Same as create, plus `addressId` (required).

**Response** `200`: `{ "address": { ... } }`

---

### Delete Address

```
DELETE /api/addresses
```

**Request Body**:

```json
{
  "addressId": "clx...",
  "userId": "clx..."
}
```

**Response** `200`: `{ "message": "Address deleted successfully" }`

---

## Reviews

### List Reviews

```
GET /api/reviews?productId=clx...
```

**Response** `200`:

```json
{
  "reviews": [
    {
      "id": "clx...",
      "userId": "cly...",
      "productId": "clx...",
      "rating": 5,
      "title": "Amazing phone!",
      "comment": "Best smartphone I've ever used.",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2025-02-01T10:00:00.000Z",
      "updatedAt": "2025-02-01T10:00:00.000Z",
      "user": { "id": "cly", "name": "Priya M.", "avatar": null }
    }
  ]
}
```

---

### Create Review

```
POST /api/reviews
```

**Request Body**:

```json
{
  "productId": "clx...",
  "userId": "cly...",
  "rating": 5,
  "title": "Amazing phone!",
  "comment": "Best smartphone I've ever used."
}
```

**Validation**: Rating must be 1–5. One review per user per product.

**Response** `201`: `{ "review": { ... } }`

**Error** `400`: `{ "error": "You have already reviewed this product" }`

---

## Questions

### List Questions

```
GET /api/questions?productId=clx...
```

Returns product questions, unanswered first, then newest.

**Response** `200`:

```json
{
  "questions": [
    {
      "id": "clx...",
      "productId": "clx...",
      "question": "Does this support 5G?",
      "answer": "Yes, it supports all Indian 5G bands.",
      "askedBy": "Amit K.",
      "helpfulYes": 12,
      "helpfulNo": 1,
      "answered": true,
      "createdAt": "2025-02-01T10:00:00.000Z",
      "updatedAt": "2025-02-02T08:00:00.000Z"
    }
  ]
}
```

---

### Create Question

```
POST /api/questions
```

**Request Body**:

```json
{
  "productId": "clx...",
  "question": "Does this come with a charger?",
  "userName": "Sneha R."
}
```

**Validation**: Question must be 5–500 characters.

**Response** `201`: `{ "question": { ... } }`

---

## Coupons

### Validate Coupon

```
POST /api/coupons/validate
```

**Request Body**:

```json
{
  "code": "WELCOME10",
  "cartTotal": 2000
}
```

**Response** (valid) `200`:

```json
{
  "valid": true,
  "discount": 200,
  "coupon": {
    "id": "clx...",
    "code": "WELCOME10",
    "description": "10% off for new users",
    "discountType": "percentage",
    "discountValue": 10,
    "minOrderValue": 500,
    "maxDiscount": 1000
  }
}
```

**Response** (invalid) `200`:

```json
{
  "valid": false,
  "message": "This coupon has expired."
}
```

---

## Payment

### Create Razorpay Order

```
POST /api/create-order
```

**Request Body**:

```json
{
  "amount": 19799820,
  "currency": "INR",
  "receipt": "order_receipt_123"
}
```

> **Note**: Amount is in **paise** (₹1 = 100 paise). Min: 100 (₹1), Max: 50000000 (₹5,00,000).

**Response** `200`:

```json
{
  "order_id": "order_LZ3K5ABC",
  "amount": 19799820,
  "currency": "INR"
}
```

**Error** `500`: `{ "error": "Payment gateway is not configured. Please contact support." }`

---

### Verify Payment

```
POST /api/verify-payment
```

**Request Body**:

```json
{
  "razorpay_order_id": "order_LZ3K5ABC",
  "razorpay_payment_id": "pay_LZ3K5DEF",
  "razorpay_signature": "abc123def456..."
}
```

**Response** (success) `200`:

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "payment_id": "pay_LZ3K5DEF",
  "order_id": "order_LZ3K5ABC"
}
```

**Error** `400`: `{ "error": "Payment verification failed. Signature mismatch." }`

---

## Newsletter

### Subscribe

```
POST /api/newsletter
```

**Request Body**:

```json
{ "email": "user@example.com" }
```

**Response** `200`:

```json
{ "message": "Successfully subscribed", "subscribed": true }
```

Already subscribed: `{ "message": "Already subscribed", "subscribed": true }`

---

## Analytics

### Track Events

```
POST /api/analytics
```

**Request Body**:

```json
{
  "events": [
    {
      "eventType": "page_view",
      "userId": "clx...",
      "sessionId": "sess_abc123",
      "data": { "page": "/product/samsung-galaxy-s24" },
      "url": "/product/samsung-galaxy-s24",
      "referrer": "https://google.com",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}
```

**Limit**: Max 50 events per request.

**Response** `200`:

```json
{ "success": true, "count": 1 }
```

---

### Get Analytics

```
GET /api/analytics?eventType=page_view&limit=100
```

**Response** `200`:

```json
{
  "events": [ ... ],
  "eventCounts": [
    { "eventType": "page_view", "count": 1500 },
    { "eventType": "add_to_cart", "count": 320 }
  ]
}
```

---

## Blog

### List Blog Posts

```
GET /api/blog?page=1&limit=10&category=tech
```

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Posts per page (1–50) |
| `category` | string | — | Filter by category |
| `slug` | string | — | Get single post by slug |

**Response** `200`:

```json
{
  "posts": [
    {
      "id": "clx...",
      "title": "Top 10 Smartphones of 2025",
      "slug": "top-10-smartphones-2025",
      "excerpt": "Discover the best smartphones...",
      "coverImage": "https://...",
      "category": "tech",
      "tags": ["smartphones", "tech", "2025"],
      "authorName": "MeraShop Team",
      "publishedAt": "2025-02-01T10:00:00.000Z",
      "createdAt": "2025-02-01T10:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "totalPages": 3
}
```

---

## FAQ

### List FAQs

```
GET /api/faq?category=shipping
```

**Response** `200`:

```json
{
  "faqs": [
    {
      "id": "clx...",
      "question": "How long does delivery take?",
      "answer": "Standard delivery takes 3-7 business days...",
      "category": "shipping",
      "sortOrder": 1,
      "isActive": true
    }
  ],
  "grouped": {
    "shipping": [ ... ],
    "returns": [ ... ],
    "payment": [ ... ]
  }
}
```

---

## Contact

### Submit Contact Message

```
POST /api/contact
```

**Request Body**:

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "subject": "Order issue",
  "message": "I have not received my order yet. Order #MSLZ3K5ABC."
}
```

**Validation**: `name`, `email`, `message` required. Message must be ≥ 10 characters.

**Response** `201`:

```json
{
  "success": true,
  "message": "Your message has been received. We will get back to you within 24 hours.",
  "id": "clx..."
}
```

---

## Stock Alerts

### Subscribe to Stock Alert

```
POST /api/stock-alert
```

**Request Body**:

```json
{
  "productId": "clx...",
  "email": "user@example.com"
}
```

**Response** `201`:

```json
{ "message": "Stock alert created successfully" }
```

---

### Get Alert Count

```
GET /api/stock-alert
```

**Response** `200`:

```json
{ "totalAlerts": 42 }
```

---

## AI

### Chat with AI Assistant

```
POST /api/ai-chat
```

**Request Body**:

```json
{
  "message": "What deals are available today?",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello! How can I help you?" }
  ]
}
```

**Response** `200`:

```json
{
  "response": "We have great deals right now! Use code WELCOME10 for 10% off..."
}
```

> Falls back to keyword-based responses if AI SDK is unavailable.

---

### AI Product Answer

```
POST /api/ai-answer
```

**Request Body**:

```json
{
  "question": "What colours are available?",
  "productName": "Samsung Galaxy S24 Ultra",
  "productId": "clx..."
}
```

**Response** `200`:

```json
{
  "answer": "This product is available in multiple colour options. Please check the variant selector above to see all available colours."
}
```

---

## Admin — Products

### List Products (Admin)

```
GET /api/admin/products?page=1&limit=20&search=samsung&categoryId=clx&status=active
```

**Response** `200`:

```json
{
  "products": [
    {
      "id": "clx...",
      "name": "Samsung Galaxy S24 Ultra",
      "slug": "samsung-galaxy-s24-ultra",
      "category": "Electronics",
      "categoryId": "clx",
      "brand": "Samsung",
      "brandId": "cly",
      "basePrice": 129999,
      "salePrice": 109999,
      "sku": "SG24-ULTRA",
      "stock": 25,
      "isActive": true,
      "isFeatured": true,
      "isNewArrival": false,
      "isBestseller": true,
      "image": "https://...",
      "variantCount": 3,
      "totalSold": 150,
      "avgRating": 4.5,
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 8,
  "categories": [{ "id": "clx", "name": "Electronics" }],
  "brands": [{ "id": "clx", "name": "Samsung" }]
}
```

---

### Create Product (Admin)

```
POST /api/admin/products
```

**Request Body**:

```json
{
  "name": "New Product",
  "slug": "new-product",
  "description": "Full description...",
  "shortDescription": "Short description",
  "categoryId": "clx...",
  "brandId": "cly...",
  "basePrice": 999,
  "salePrice": 799,
  "sku": "NP-001",
  "stock": 50,
  "tags": "new,featured",
  "specifications": "{\"RAM\": \"8GB\"}",
  "isFeatured": true,
  "isNewArrival": true,
  "isBestseller": false,
  "isActive": true,
  "images": [
    { "url": "https://...", "altText": "Product image", "sortOrder": 0, "isPrimary": true }
  ],
  "variants": [
    { "name": "Color", "value": "Black", "sku": "NP-001-BK", "price": null, "stock": 25 }
  ]
}
```

**Response** `201`: `{ "product": { ... } }`

---

### Get Product by ID (Admin)

```
GET /api/admin/products/[id]
```

**Response** `200`: `{ "product": { ... with full relations } }`

---

### Update Product (Admin)

```
PUT /api/admin/products/[id]
```

**Request Body**: Partial update — only include fields to change.

**Response** `200`: `{ "product": { ... } }`

---

### Delete Product (Admin)

```
DELETE /api/admin/products/[id]
```

Performs a **soft delete** (sets `deletedAt` timestamp and `isActive: false`).

**Response** `200`: `{ "success": true }`

---

### Bulk Product Actions (Admin)

```
POST /api/admin/products/bulk
```

**Request Body**:

```json
{
  "action": "delete",
  "ids": ["clx1...", "clx2...", "clx3..."]
}
```

Or:

```json
{
  "action": "changeStatus",
  "ids": ["clx1...", "clx2..."],
  "status": "active"
}
```

**Actions**: `delete` (soft delete), `changeStatus` (`active`/`draft`/`archived`)

**Limit**: Max 100 items per bulk operation.

**Response** `200`:

```json
{ "success": true, "affected": 3 }
```

---

## Admin — Orders

### List Orders (Admin)

```
GET /api/admin/orders?page=1&limit=20&status=delivered&search=MSLZ3K
```

**Response** `200`:

```json
{
  "orders": [
    {
      "id": "clx...",
      "orderNumber": "MSLZ3K5ABC",
      "customer": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+919876543210",
      "status": "delivered",
      "total": 197998.2,
      "subtotal": 219998,
      "shippingCost": 0,
      "discountAmount": 21999.8,
      "taxAmount": 0,
      "items": 2,
      "orderItems": [ ... ],
      "payment": { "method": "upi", "status": "completed" },
      "shippingAddress": { ... },
      "trackingNumber": "DTDC123456",
      "trackingUrl": "https://...",
      "couponCode": "WELCOME10",
      "adminNotes": null,
      "customerNotes": null,
      "estimatedDelivery": "2025-03-10",
      "deliveredAt": "2025-03-09T14:30:00.000Z",
      "createdAt": "2025-03-05T10:00:00.000Z",
      "updatedAt": "2025-03-09T14:30:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

---

### Get Order by ID (Admin)

```
GET /api/admin/orders/[id]
```

**Response** `200`: `{ "order": { ... with full relations } }`

---

### Update Order (Admin)

```
PUT /api/admin/orders/[id]
```

**Request Body**:

```json
{
  "status": "shipped",
  "trackingNumber": "DTDC789012",
  "trackingUrl": "https://track.dtdc.in/DTDC789012",
  "adminNotes": "Shipped via DTDC express"
}
```

Valid statuses: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

> Setting status to `delivered` automatically sets `deliveredAt` to current time.

---

### Bulk Order Status Update (Admin)

```
POST /api/admin/orders/bulk
```

**Request Body**:

```json
{
  "action": "updateStatus",
  "ids": ["clx1...", "clx2..."],
  "status": "shipped"
}
```

**Response** `200`: `{ "success": true, "affected": 2 }`

---

## Admin — Users

### List Users (Admin)

```
GET /api/admin/users?page=1&limit=20&search=rahul&role=customer
```

**Response** `200`:

```json
{
  "users": [
    {
      "id": "clx...",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+919876543210",
      "avatar": null,
      "role": "customer",
      "isActive": true,
      "orders": 5,
      "addresses": 2,
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "total": 200,
  "page": 1,
  "totalPages": 10
}
```

---

### Get User by ID (Admin)

```
GET /api/admin/users/[id]
```

Returns user with recent orders, addresses, and counts.

---

### Update User (Admin)

```
PUT /api/admin/users/[id]
```

**Request Body**:

```json
{
  "name": "Rahul Sharma",
  "phone": "+919876543210",
  "role": "admin",
  "isActive": true
}
```

---

## Admin — Categories

### List Categories (Admin)

```
GET /api/admin/categories
```

Returns all categories with parent names and product/children counts.

---

### Create Category (Admin)

```
POST /api/admin/categories
```

**Request Body**:

```json
{
  "name": "Wearables",
  "slug": "wearables",
  "description": "Smartwatches, fitness bands & more",
  "image": "https://...",
  "parentId": "clx...",
  "sortOrder": 5,
  "isActive": true
}
```

---

## Admin — Coupons

### List Coupons (Admin)

```
GET /api/admin/coupons
```

---

### Create Coupon (Admin)

```
POST /api/admin/coupons
```

**Request Body**:

```json
{
  "code": "DIWALI25",
  "description": "25% off during Diwali",
  "discountType": "percentage",
  "discountValue": 25,
  "minOrderValue": 1000,
  "maxDiscount": 2000,
  "usageLimit": 500,
  "perUserLimit": 1,
  "isActive": true,
  "startsAt": "2025-10-15T00:00:00.000Z",
  "expiresAt": "2025-11-15T23:59:59.000Z"
}
```

---

### Update Coupon (Admin)

```
PUT /api/admin/coupons/[id]
```

---

### Delete Coupon (Admin)

```
DELETE /api/admin/coupons/[id]
```

Hard deletes the coupon.

---

## Admin — Banners

### List Banners (Admin)

```
GET /api/admin/banners
```

Returns all banners (including inactive), ordered by sort order.

---

### Create Banner (Admin)

```
POST /api/admin/banners
```

**Request Body**:

```json
{
  "title": "Diwali Sale!",
  "subtitle": "Up to 80% off",
  "image": "https://...",
  "linkUrl": "/shop?sale=diwali",
  "linkText": "Shop Diwali Deals",
  "position": "hero",
  "sortOrder": 1,
  "isActive": true,
  "startsAt": "2025-10-15T00:00:00.000Z",
  "expiresAt": "2025-11-15T23:59:59.000Z"
}
```

---

## Admin — Blog

### List Blog Posts (Admin)

```
GET /api/admin/blog?page=1&limit=20&category=tech
```

---

### Create Blog Post (Admin)

```
POST /api/admin/blog
```

**Request Body**:

```json
{
  "title": "Top 10 Smartphones of 2025",
  "slug": "top-10-smartphones-2025",
  "excerpt": "Discover the best smartphones available in India...",
  "content": "Full markdown content...",
  "coverImage": "https://...",
  "category": "tech",
  "tags": "smartphones,tech,2025",
  "authorName": "MeraShop Team",
  "isPublished": true,
  "seoTitle": "Top 10 Smartphones 2025 - MeraShop Blog",
  "seoDescription": "Compare the best smartphones..."
}
```

---

### Update / Delete Blog Post (Admin)

```
PUT /api/admin/blog/[id]
DELETE /api/admin/blog/[id]
```

---

## Admin — Dashboard

### Get Dashboard Stats

```
GET /api/admin/dashboard
```

**Response** `200`:

```json
{
  "stats": {
    "totalRevenue": 1523450.50,
    "ordersToday": 12,
    "totalProducts": 85,
    "activeUsers": 234
  },
  "recentOrders": [
    {
      "id": "clx...",
      "orderNumber": "MSLZ3K5ABC",
      "customer": "Rahul Sharma",
      "total": 197998.2,
      "status": "delivered",
      "items": 2,
      "date": "2025-03-05T10:00:00.000Z"
    }
  ],
  "topProducts": [
    {
      "id": "clx...",
      "name": "Samsung Galaxy S24 Ultra",
      "category": "Electronics",
      "price": 109999,
      "sold": 150,
      "image": "https://..."
    }
  ],
  "lowStockProducts": [
    {
      "id": "clx...",
      "name": "Wireless Earbuds",
      "category": "Electronics",
      "stock": 3,
      "threshold": 10
    }
  ],
  "revenueChart": [
    { "month": "2025-01", "revenue": 245000 },
    { "month": "2025-02", "revenue": 312000 },
    { "month": "2025-03", "revenue": 289000 }
  ],
  "ordersByStatus": [
    { "status": "delivered", "count": 150 },
    { "status": "shipped", "count": 25 },
    { "status": "pending", "count": 10 }
  ]
}
```

---

## Error Handling

All API endpoints follow consistent error handling:

| Status Code | Meaning |
|-------------|---------|
| `200` | Success |
| `201` | Created successfully |
| `400` | Bad request — validation error, missing fields |
| `401` | Unauthorized — invalid credentials |
| `403` | Forbidden — account deactivated |
| `404` | Not found — resource doesn't exist |
| `409` | Conflict — duplicate resource |
| `429` | Too many requests |
| `500` | Internal server error |

**Error Response Format**:

```json
{ "error": "Human-readable error message" }
```
