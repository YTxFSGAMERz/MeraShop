// MeraShop - Comprehensive Seed Script
// Populates the database with realistic Indian e-commerce sample data

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting MeraShop database seed...\n')

  // ============================================
  // STEP 1: Clear existing data (reverse dependency order)
  // ============================================
  console.log('🧹 Clearing existing data...')

  await prisma.analyticsEvent.deleteMany()
  await prisma.contactMessage.deleteMany()
  await prisma.newsletterSubscriber.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.review.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.address.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.fAQ.deleteMany()
  await prisma.banner.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Existing data cleared\n')

  // ============================================
  // STEP 2: Create Categories
  // ============================================
  console.log('📁 Creating categories...')

  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets, smartphones, laptops and accessories',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      sortOrder: 1,
      isActive: true,
    },
  })

  const smartphones = await prisma.category.create({
    data: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest smartphones from top brands',
      parentId: electronics.id,
      sortOrder: 1,
      isActive: true,
    },
  })

  const laptops = await prisma.category.create({
    data: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Laptops for work, gaming and everyday use',
      parentId: electronics.id,
      sortOrder: 2,
      isActive: true,
    },
  })

  const audio = await prisma.category.create({
    data: {
      name: 'Audio',
      slug: 'audio',
      description: 'Headphones, earbuds, speakers and more',
      parentId: electronics.id,
      sortOrder: 3,
      isActive: true,
    },
  })

  const accessories = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Tech accessories and gadgets',
      parentId: electronics.id,
      sortOrder: 4,
      isActive: true,
    },
  })

  const fashion = await prisma.category.create({
    data: {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Trendy clothing, footwear and accessories',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
      sortOrder: 2,
      isActive: true,
    },
  })

  const menFashion = await prisma.category.create({
    data: {
      name: 'Men',
      slug: 'men-fashion',
      description: "Men's clothing, footwear and accessories",
      parentId: fashion.id,
      sortOrder: 1,
      isActive: true,
    },
  })

  const womenFashion = await prisma.category.create({
    data: {
      name: 'Women',
      slug: 'women-fashion',
      description: "Women's clothing, footwear and accessories",
      parentId: fashion.id,
      sortOrder: 2,
      isActive: true,
    },
  })

  const kidsFashion = await prisma.category.create({
    data: {
      name: 'Kids',
      slug: 'kids-fashion',
      description: "Kids' clothing and accessories",
      parentId: fashion.id,
      sortOrder: 3,
      isActive: true,
    },
  })

  const homeKitchen = await prisma.category.create({
    data: {
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Kitchen appliances, cookware and home essentials',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      sortOrder: 3,
      isActive: true,
    },
  })

  const beauty = await prisma.category.create({
    data: {
      name: 'Beauty & Personal Care',
      slug: 'beauty-personal-care',
      description: 'Skincare, haircare, makeup and grooming essentials',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
      sortOrder: 4,
      isActive: true,
    },
  })

  const sports = await prisma.category.create({
    data: {
      name: 'Sports & Fitness',
      slug: 'sports-fitness',
      description: 'Sports equipment, gym wear and fitness accessories',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
      sortOrder: 5,
      isActive: true,
    },
  })

  const books = await prisma.category.create({
    data: {
      name: 'Books',
      slug: 'books',
      description: 'Bestsellers, fiction, non-fiction and academic books',
      sortOrder: 6,
      isActive: true,
    },
  })

  const grocery = await prisma.category.create({
    data: {
      name: 'Grocery & Gourmet',
      slug: 'grocery-gourmet',
      description: 'Premium groceries, organic food and gourmet items',
      sortOrder: 7,
      isActive: true,
    },
  })

  const toysBaby = await prisma.category.create({
    data: {
      name: 'Toys & Baby',
      slug: 'toys-baby',
      description: 'Toys, games and baby care essentials',
      sortOrder: 8,
      isActive: true,
    },
  })

  const automotive = await prisma.category.create({
    data: {
      name: 'Automotive',
      slug: 'automotive',
      description: 'Car accessories, bike parts and automotive essentials',
      sortOrder: 9,
      isActive: true,
    },
  })

  const health = await prisma.category.create({
    data: {
      name: 'Health & Wellness',
      slug: 'health-wellness',
      description: 'Health supplements, medical devices and wellness products',
      sortOrder: 10,
      isActive: true,
    },
  })

  console.log(`✅ Created ${17} categories\n`)

  // ============================================
  // STEP 3: Create Brands
  // ============================================
  console.log('🏷️ Creating brands...')

  const brandsData = [
    { name: 'Samsung', slug: 'samsung', description: 'Leading global electronics brand with cutting-edge technology' },
    { name: 'Apple', slug: 'apple', description: 'Premium technology products known for innovation and design' },
    { name: 'OnePlus', slug: 'oneplus', description: 'Flagship killer smartphones and premium tech' },
    { name: 'Xiaomi', slug: 'xiaomi', description: 'Smart technology at honest pricing' },
    { name: 'boAt', slug: 'boat', description: "India's leading audio and wearable brand" },
    { name: 'Noise', slug: 'noise', description: 'Trendy smartwatches and audio products' },
    { name: 'Lenovo', slug: 'lenovo', description: 'Innovative laptops, tablets and smart devices' },
    { name: 'HP', slug: 'hp', description: 'Reliable computing and printing solutions' },
    { name: 'Dell', slug: 'dell', description: 'High-performance laptops and enterprise solutions' },
    { name: 'Allen Solly', slug: 'allen-solly', description: 'Contemporary workwear and casual fashion' },
    { name: 'Van Heusen', slug: 'van-heusen', description: 'Premium formal and smart casual wear' },
    { name: 'Levis', slug: 'levis', description: 'Iconic denim and casual wear since 1853' },
    { name: 'Nike', slug: 'nike', description: 'World-class athletic footwear and sportswear' },
    { name: 'Adidas', slug: 'adidas', description: 'Sportswear and lifestyle products for athletes' },
    { name: 'Puma', slug: 'puma', description: 'Sport-inspired lifestyle products' },
    { name: 'H&M', slug: 'hm', description: 'Fashion-forward clothing at great prices' },
    { name: 'Prestige', slug: 'prestige', description: "India's most trusted kitchen appliances brand" },
    { name: 'Pigeon', slug: 'pigeon', description: 'Affordable and reliable kitchen essentials' },
    { name: 'Bajaj', slug: 'bajaj', description: 'Trusted Indian home appliances and electronics' },
    { name: 'Havells', slug: 'havells', description: 'Premium electrical and home appliances' },
    { name: 'Philips', slug: 'philips', description: 'Innovation in healthcare, lighting and consumer lifestyle' },
    { name: 'Bombay Shaving Company', slug: 'bombay-shaving-company', description: 'Premium men grooming products' },
    { name: 'Mamaearth', slug: 'mamaearth', description: 'Toxin-free skincare and haircare products' },
  ]

  const brandRecords: Record<string, { id: string }> = {}
  for (const brand of brandsData) {
    const record = await prisma.brand.create({ data: brand })
    brandRecords[brand.slug] = record
  }

  console.log(`✅ Created ${brandsData.length} brands\n`)

  // ============================================
  // STEP 4: Create Products
  // ============================================
  console.log('📦 Creating products...')

  // Helper to create a product with images and variants
  async function createProduct(data: {
    name: string
    slug: string
    description: string
    shortDescription: string
    categoryId: string
    brandId: string
    basePrice: number
    salePrice: number | null
    sku: string
    images: { url: string; altText: string; isPrimary: boolean; sortOrder: number }[]
    variants?: { name: string; value: string; sku: string; price: number | null; stock: number }[]
    stock: number
    isFeatured?: boolean
    isNewArrival?: boolean
    isBestseller?: boolean
    tags: string
    specifications: string
    seoTitle: string
    seoDescription: string
    weight?: number
    shippingFree?: boolean
    returnPolicy?: string
    totalSold?: number
    avgRating?: number
    reviewCount?: number
  }) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        categoryId: data.categoryId,
        brandId: data.brandId,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        sku: data.sku,
        stock: data.stock,
        isFeatured: data.isFeatured ?? false,
        isNewArrival: data.isNewArrival ?? false,
        isBestseller: data.isBestseller ?? false,
        tags: data.tags,
        specifications: data.specifications,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        weight: data.weight,
        shippingFree: data.shippingFree ?? false,
        returnPolicy: data.returnPolicy ?? '7 days',
        totalSold: data.totalSold ?? 0,
        avgRating: data.avgRating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        images: {
          create: data.images,
        },
        variants: data.variants
          ? {
              create: data.variants,
            }
          : undefined,
      },
    })
    return product
  }

  // --- Electronics: Smartphones ---
  const samsungGalaxy = await createProduct({
    name: 'Samsung Galaxy S24 Ultra 5G',
    slug: 'samsung-galaxy-s24-ultra-5g',
    description:
      'Experience the pinnacle of smartphone innovation with the Samsung Galaxy S24 Ultra. Featuring a stunning 6.8" Dynamic AMOLED 2X display, powerful Snapdragon 8 Gen 3 processor, and a revolutionary 200MP camera system with AI-powered photography. Built-in S Pen for productivity, titanium frame for durability, and Galaxy AI features that redefine what a smartphone can do.',
    shortDescription: 'Flagship smartphone with 200MP camera, S Pen & Galaxy AI',
    categoryId: smartphones.id,
    brandId: brandRecords['samsung'].id,
    basePrice: 134999,
    salePrice: 109999,
    sku: 'SAM-S24U-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop', altText: 'Samsung Galaxy S24 Ultra Front', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', altText: 'Samsung Galaxy S24 Ultra Side', isPrimary: false, sortOrder: 1 },
      { url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop', altText: 'Samsung Galaxy S24 Ultra Camera', isPrimary: false, sortOrder: 2 },
    ],
    variants: [
      { name: 'Color', value: 'Titanium Black', sku: 'SAM-S24U-BK', price: null, stock: 25 },
      { name: 'Color', value: 'Titanium Gray', sku: 'SAM-S24U-GR', price: null, stock: 18 },
      { name: 'Color', value: 'Titanium Violet', sku: 'SAM-S24U-VT', price: null, stock: 12 },
      { name: 'Storage', value: '256GB', sku: 'SAM-S24U-256', price: null, stock: 30 },
      { name: 'Storage', value: '512GB', sku: 'SAM-S24U-512', price: 119999, stock: 15 },
    ],
    stock: 55,
    isFeatured: true,
    isBestseller: true,
    tags: 'smartphone,samsung,5g,flagship,camera,ai,s-pen',
    specifications: JSON.stringify({
      Display: '6.8" Dynamic AMOLED 2X, 3120x1440, 120Hz',
      Processor: 'Snapdragon 8 Gen 3',
      RAM: '12GB',
      Storage: '256GB / 512GB',
      'Rear Camera': '200MP + 12MP + 50MP + 10MP',
      'Front Camera': '12MP',
      Battery: '5000mAh',
      OS: 'Android 14, One UI 6.1',
      Connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, NFC',
    }),
    seoTitle: 'Samsung Galaxy S24 Ultra 5G - Buy Online at Best Price in India',
    seoDescription: 'Shop Samsung Galaxy S24 Ultra 5G with 200MP camera, S Pen, Galaxy AI features. Free delivery, EMI options available. Order now on MeraShop!',
    weight: 232,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 342,
    avgRating: 4.6,
    reviewCount: 128,
  })

  const iPhone15 = await createProduct({
    name: 'Apple iPhone 15 Pro Max',
    slug: 'apple-iphone-15-pro-max',
    description:
      'The most powerful iPhone ever. Featuring a titanium design, A17 Pro chip, 48MP camera system with 5x optical zoom, and Action Button for quick access to your favorite features. Super Retina XDR display with ProMotion, always-on display, and USB-C for versatile connectivity.',
    shortDescription: 'Premium iPhone with A17 Pro chip, titanium design & 5x zoom',
    categoryId: smartphones.id,
    brandId: brandRecords['apple'].id,
    basePrice: 159900,
    salePrice: 144900,
    sku: 'APL-IP15PM-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop', altText: 'iPhone 15 Pro Max Front', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=400&fit=crop', altText: 'iPhone 15 Pro Max Back', isPrimary: false, sortOrder: 1 },
    ],
    variants: [
      { name: 'Color', value: 'Natural Titanium', sku: 'APL-IP15PM-NT', price: null, stock: 20 },
      { name: 'Color', value: 'Blue Titanium', sku: 'APL-IP15PM-BT', price: null, stock: 15 },
      { name: 'Storage', value: '256GB', sku: 'APL-IP15PM-256', price: null, stock: 35 },
      { name: 'Storage', value: '512GB', sku: 'APL-IP15PM-512', price: 164900, stock: 10 },
    ],
    stock: 45,
    isFeatured: true,
    isBestseller: true,
    tags: 'iphone,apple,5g,premium,camera,pro',
    specifications: JSON.stringify({
      Display: '6.7" Super Retina XDR OLED, 2796x1290, 120Hz',
      Processor: 'A17 Pro',
      RAM: '8GB',
      Storage: '256GB / 512GB / 1TB',
      'Rear Camera': '48MP + 12MP + 12MP',
      'Front Camera': '12MP',
      Battery: '4441mAh',
      OS: 'iOS 17',
      Connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3, USB-C',
    }),
    seoTitle: 'Apple iPhone 15 Pro Max - Buy Online at Best Price in India',
    seoDescription: 'Shop Apple iPhone 15 Pro Max with A17 Pro chip, titanium design, 48MP camera. EMI options, free delivery on MeraShop.',
    weight: 221,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 528,
    avgRating: 4.7,
    reviewCount: 256,
  })

  const onePlus12 = await createProduct({
    name: 'OnePlus 12 5G',
    slug: 'oneplus-12-5g',
    description:
      'The OnePlus 12 sets a new standard for flagship smartphones. Powered by Snapdragon 8 Gen 3, featuring a stunning 2K LTPO AMOLED display, Hasselblad camera system with 50MP main sensor, and 100W SUPERVOOC charging. Experience smooth performance with 16GB RAM and OxygenOS.',
    shortDescription: 'Flagship killer with Hasselblad camera & 100W charging',
    categoryId: smartphones.id,
    brandId: brandRecords['oneplus'].id,
    basePrice: 69999,
    salePrice: 59999,
    sku: 'OP-12-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop', altText: 'OnePlus 12 Front', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop', altText: 'OnePlus 12 Back', isPrimary: false, sortOrder: 1 },
    ],
    variants: [
      { name: 'Color', value: 'Flowy Emerald', sku: 'OP-12-FE', price: null, stock: 30 },
      { name: 'Color', value: 'Silky Black', sku: 'OP-12-SB', price: null, stock: 25 },
    ],
    stock: 55,
    isFeatured: true,
    isNewArrival: true,
    tags: 'oneplus,smartphone,5g,hasselblad,flagship',
    specifications: JSON.stringify({
      Display: '6.82" LTPO AMOLED, 3168x1440, 120Hz',
      Processor: 'Snapdragon 8 Gen 3',
      RAM: '12GB / 16GB',
      Storage: '256GB / 512GB',
      'Rear Camera': '50MP + 48MP + 64MP',
      'Front Camera': '32MP',
      Battery: '5400mAh',
      OS: 'Android 14, OxygenOS 14',
      Connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, NFC',
    }),
    seoTitle: 'OnePlus 12 5G - Buy Online at Best Price in India | MeraShop',
    seoDescription: 'Shop OnePlus 12 5G with Hasselblad camera, 100W charging, Snapdragon 8 Gen 3. Best deals on MeraShop with EMI options.',
    weight: 220,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 410,
    avgRating: 4.5,
    reviewCount: 189,
  })

  const redmiNote = await createProduct({
    name: 'Xiaomi Redmi Note 13 Pro 5G',
    slug: 'xiaomi-redmi-note-13-pro-5g',
    description:
      'The ultimate mid-range smartphone with a 200MP camera, Snapdragon 7s Gen 2 processor, and a gorgeous 6.67" AMOLED display with 120Hz refresh rate. 67W turbo charging keeps you powered up all day. Premium glass back design at an incredible price.',
    shortDescription: '200MP camera phone with AMOLED display & 67W charging',
    categoryId: smartphones.id,
    brandId: brandRecords['xiaomi'].id,
    basePrice: 24999,
    salePrice: 19999,
    sku: 'XIA-RN13P-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop', altText: 'Redmi Note 13 Pro Front', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop', altText: 'Redmi Note 13 Pro Back', isPrimary: false, sortOrder: 1 },
    ],
    variants: [
      { name: 'Color', value: 'Coral Purple', sku: 'XIA-RN13P-CP', price: null, stock: 50 },
      { name: 'Color', value: 'Midnight Black', sku: 'XIA-RN13P-MB', price: null, stock: 60 },
      { name: 'Storage', value: '128GB', sku: 'XIA-RN13P-128', price: null, stock: 70 },
      { name: 'Storage', value: '256GB', sku: 'XIA-RN13P-256', price: 21999, stock: 40 },
    ],
    stock: 110,
    isBestseller: true,
    tags: 'xiaomi,redmi,smartphone,5g,200mp,budget',
    specifications: JSON.stringify({
      Display: '6.67" AMOLED, 2400x1080, 120Hz',
      Processor: 'Snapdragon 7s Gen 2',
      RAM: '8GB',
      Storage: '128GB / 256GB',
      'Rear Camera': '200MP + 8MP + 2MP',
      'Front Camera': '16MP',
      Battery: '5100mAh',
      OS: 'Android 13, MIUI 14',
      Connectivity: '5G, Wi-Fi 6, Bluetooth 5.2, NFC',
    }),
    seoTitle: 'Xiaomi Redmi Note 13 Pro 5G - Best Price in India | MeraShop',
    seoDescription: 'Shop Redmi Note 13 Pro 5G with 200MP camera at best price. Free delivery, EMI options on MeraShop.',
    weight: 187,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 1250,
    avgRating: 4.3,
    reviewCount: 567,
  })

  // --- Electronics: Laptops ---
  const macBookAir = await createProduct({
    name: 'Apple MacBook Air M3',
    slug: 'apple-macbook-air-m3',
    description:
      'Incredibly thin. Incredibly powerful. The MacBook Air with M3 chip delivers up to 18 hours of battery life, a brilliant 13.6" Liquid Retina display, and a silent fanless design. Perfect for work, creativity, and entertainment on the go.',
    shortDescription: 'Ultra-thin laptop with M3 chip & 18hr battery life',
    categoryId: laptops.id,
    brandId: brandRecords['apple'].id,
    basePrice: 114900,
    salePrice: 99900,
    sku: 'APL-MBA-M3-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', altText: 'MacBook Air M3 Open', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop', altText: 'MacBook Air M3 Side', isPrimary: false, sortOrder: 1 },
    ],
    variants: [
      { name: 'Color', value: 'Midnight', sku: 'APL-MBA-M3-MN', price: null, stock: 12 },
      { name: 'Color', value: 'Starlight', sku: 'APL-MBA-M3-SL', price: null, stock: 10 },
      { name: 'Storage', value: '256GB', sku: 'APL-MBA-M3-256', price: null, stock: 22 },
      { name: 'Storage', value: '512GB', sku: 'APL-MBA-M3-512', price: 124900, stock: 8 },
    ],
    stock: 30,
    isFeatured: true,
    tags: 'macbook,laptop,apple,m3,ultrabook,premium',
    specifications: JSON.stringify({
      Display: '13.6" Liquid Retina, 2560x1664',
      Processor: 'Apple M3 (8-core CPU, 8-core GPU)',
      RAM: '8GB Unified',
      Storage: '256GB / 512GB SSD',
      Battery: 'Up to 18 hours',
      Weight: '1.24 kg',
      OS: 'macOS Sonoma',
      Ports: '2x Thunderbolt, MagSafe, 3.5mm',
    }),
    seoTitle: 'Apple MacBook Air M3 - Buy at Best Price in India | MeraShop',
    seoDescription: 'Shop Apple MacBook Air M3 with 18hr battery, Liquid Retina display. No-cost EMI, free delivery on MeraShop.',
    weight: 1240,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 185,
    avgRating: 4.8,
    reviewCount: 92,
  })

  const hpPavilion = await createProduct({
    name: 'HP Pavilion 15 i5 12th Gen',
    slug: 'hp-pavilion-15-i5-12th-gen',
    description:
      'Power through your day with the HP Pavilion 15. Equipped with 12th Gen Intel Core i5 processor, 16GB RAM, and 512GB SSD for seamless multitasking. 15.6" FHD IPS display, backlit keyboard, and B&O audio for immersive entertainment.',
    shortDescription: 'Everyday laptop with Intel i5, 16GB RAM & B&O audio',
    categoryId: laptops.id,
    brandId: brandRecords['hp'].id,
    basePrice: 74999,
    salePrice: 58990,
    sku: 'HP-PAV15-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', altText: 'HP Pavilion 15 Open', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=400&fit=crop', altText: 'HP Pavilion 15 Side View', isPrimary: false, sortOrder: 1 },
    ],
    stock: 35,
    isNewArrival: true,
    tags: 'laptop,hp,pavilion,intel,i5,student,office',
    specifications: JSON.stringify({
      Display: '15.6" FHD IPS, 1920x1080',
      Processor: 'Intel Core i5-1235U',
      RAM: '16GB DDR4',
      Storage: '512GB SSD',
      Graphics: 'Intel Iris Xe',
      Battery: 'Up to 8 hours',
      Weight: '1.75 kg',
      OS: 'Windows 11 Home',
    }),
    seoTitle: 'HP Pavilion 15 i5 12th Gen - Buy Online | MeraShop',
    seoDescription: 'Shop HP Pavilion 15 with i5 12th Gen, 16GB RAM at best price. Student discounts available on MeraShop.',
    weight: 1750,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 220,
    avgRating: 4.2,
    reviewCount: 145,
  })

  // --- Electronics: Audio ---
  const boAtAirdopes = await createProduct({
    name: 'boAt Airdopes 141 TWS Earbuds',
    slug: 'boat-airdopes-141-tws-earbuds',
    description:
      "India's favourite TWS earbuds! boAt Airdopes 141 features 42H total playback, ENx noise cancellation, low latency mode for gaming, and IPX5 water resistance. With IWP tech for instant pairing and beast mode for gaming, these earbuds are your perfect everyday companion.",
    shortDescription: '42H playback, ENx noise cancellation & low latency',
    categoryId: audio.id,
    brandId: brandRecords['boat'].id,
    basePrice: 4490,
    salePrice: 1299,
    sku: 'BOAT-AP141-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop', altText: 'boAt Airdopes 141', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop', altText: 'boAt Airdopes 141 Case', isPrimary: false, sortOrder: 1 },
    ],
    variants: [
      { name: 'Color', value: 'Cider Cyan', sku: 'BOAT-AP141-CC', price: null, stock: 200 },
      { name: 'Color', value: 'Bold Black', sku: 'BOAT-AP141-BB', price: null, stock: 180 },
      { name: 'Color', value: 'Cherry Blossom', sku: 'BOAT-AP141-CB', price: null, stock: 150 },
    ],
    stock: 530,
    isBestseller: true,
    isFeatured: true,
    tags: 'earbuds,tws,boat,wireless,audio,bluetooth',
    specifications: JSON.stringify({
      Driver: '8mm',
      'Battery Life': '42H total, 6H earbuds',
      Connectivity: 'Bluetooth 5.1',
      'Water Resistance': 'IPX5',
      Features: 'ENx NC, Beast Mode, IWP',
      Charging: 'USB Type-C',
      Weight: '4g per earbud',
    }),
    seoTitle: 'boAt Airdopes 141 TWS Earbuds - Buy at Best Price | MeraShop',
    seoDescription: 'Shop boAt Airdopes 141 with 42H playback, ENx NC at just ₹1,299. Free delivery on MeraShop!',
    weight: 48,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 4520,
    avgRating: 4.1,
    reviewCount: 8900,
  })

  const noiseFit = await createProduct({
    name: 'Noise ColorFit Pro 5 Smartwatch',
    slug: 'noise-colorfit-pro-5-smartwatch',
    description:
      'Elevate your fitness game with Noise ColorFit Pro 5. Features a stunning 1.85" AMOLED display, Nebula UI, heart rate & SpO2 monitoring, 100+ sports modes, and up to 7 days battery life. Stay connected with smart notifications and Bluetooth calling.',
    shortDescription: 'AMOLED smartwatch with BT calling & 100+ sports modes',
    categoryId: accessories.id,
    brandId: brandRecords['noise'].id,
    basePrice: 7999,
    salePrice: 3499,
    sku: 'NOI-CFP5-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', altText: 'Noise ColorFit Pro 5', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400&h=400&fit=crop', altText: 'Noise ColorFit Pro 5 Side', isPrimary: false, sortOrder: 1 },
    ],
    variants: [
      { name: 'Color', value: 'Jet Black', sku: 'NOI-CFP5-JB', price: null, stock: 80 },
      { name: 'Color', value: 'Rose Pink', sku: 'NOI-CFP5-RP', price: null, stock: 60 },
      { name: 'Strap', value: 'Silicone', sku: 'NOI-CFP5-SI', price: null, stock: 100 },
      { name: 'Strap', value: 'Metallic', sku: 'NOI-CFP5-MT', price: 4499, stock: 40 },
    ],
    stock: 140,
    isNewArrival: true,
    isBestseller: true,
    tags: 'smartwatch,noise,fitness,amoled,bt-calling',
    specifications: JSON.stringify({
      Display: '1.85" AMOLED, 390x450',
      'Battery Life': 'Up to 7 days',
      'Health Sensors': 'Heart Rate, SpO2, Stress',
      'Sports Modes': '100+',
      Connectivity: 'Bluetooth 5.3',
      'Water Resistance': 'IP68',
      Features: 'BT Calling, Nebula UI, Smart Notifications',
    }),
    seoTitle: 'Noise ColorFit Pro 5 Smartwatch - Buy Online | MeraShop',
    seoDescription: 'Shop Noise ColorFit Pro 5 with AMOLED display, BT calling at best price. Free delivery on MeraShop!',
    weight: 42,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 2100,
    avgRating: 4.0,
    reviewCount: 3200,
  })

  // --- Fashion: Men ---
  const allenSollyShirt = await createProduct({
    name: 'Allen Solly Men Slim Fit Formal Shirt',
    slug: 'allen-solly-men-slim-fit-formal-shirt',
    description:
      'Look sharp and professional with this Allen Solly slim fit formal shirt. Crafted from premium cotton blend fabric, it features a spread collar, full sleeves with barrel cuffs, and a tailored fit that keeps you comfortable all day long. Perfect for office wear and formal occasions.',
    shortDescription: 'Premium cotton blend formal shirt with slim fit',
    categoryId: menFashion.id,
    brandId: brandRecords['allen-solly'].id,
    basePrice: 2499,
    salePrice: 1249,
    sku: 'AS-MSH-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop', altText: 'Allen Solly Formal Shirt', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop', altText: 'Allen Solly Shirt Detail', isPrimary: false, sortOrder: 1 },
    ],
    variants: [
      { name: 'Size', value: 'S', sku: 'AS-MSH-S', price: null, stock: 20 },
      { name: 'Size', value: 'M', sku: 'AS-MSH-M', price: null, stock: 35 },
      { name: 'Size', value: 'L', sku: 'AS-MSH-L', price: null, stock: 30 },
      { name: 'Size', value: 'XL', sku: 'AS-MSH-XL', price: null, stock: 25 },
      { name: 'Size', value: 'XXL', sku: 'AS-MSH-XXL', price: null, stock: 15 },
      { name: 'Color', value: 'White', sku: 'AS-MSH-WH', price: null, stock: 40 },
      { name: 'Color', value: 'Light Blue', sku: 'AS-MSH-LB', price: null, stock: 35 },
    ],
    stock: 125,
    tags: 'shirt,formal,men,allen-solly,office,cotton',
    specifications: JSON.stringify({
      Fabric: 'Cotton Blend',
      Fit: 'Slim Fit',
      Collar: 'Spread Collar',
      Sleeves: 'Full Sleeve',
      Pattern: 'Solid',
      Occasion: 'Formal / Office',
      WashCare: 'Machine Wash',
    }),
    seoTitle: 'Allen Solly Men Slim Fit Formal Shirt - Buy Online | MeraShop',
    seoDescription: 'Shop Allen Solly formal shirts at 50% off. Premium cotton blend, slim fit. Free delivery on MeraShop!',
    weight: 200,
    shippingFree: true,
    returnPolicy: '15 days',
    totalSold: 890,
    avgRating: 4.3,
    reviewCount: 456,
  })

  const nikeAirMax = await createProduct({
    name: 'Nike Air Max 270 Men Running Shoes',
    slug: 'nike-air-max-270-men-running-shoes',
    description:
      'Run in style with Nike Air Max 270. Featuring the largest Max Air unit yet for unmatched cushioning, breathable mesh upper, and durable rubber outsole. These shoes combine iconic Nike design with modern comfort technology for your daily runs and workouts.',
    shortDescription: 'Running shoes with Max Air cushioning & breathable mesh',
    categoryId: menFashion.id,
    brandId: brandRecords['nike'].id,
    basePrice: 14995,
    salePrice: 9995,
    sku: 'NK-AM270-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', altText: 'Nike Air Max 270', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop', altText: 'Nike Air Max 270 Side', isPrimary: false, sortOrder: 1 },
    ],
    variants: [
      { name: 'Size', value: 'UK 7', sku: 'NK-AM270-7', price: null, stock: 15 },
      { name: 'Size', value: 'UK 8', sku: 'NK-AM270-8', price: null, stock: 20 },
      { name: 'Size', value: 'UK 9', sku: 'NK-AM270-9', price: null, stock: 18 },
      { name: 'Size', value: 'UK 10', sku: 'NK-AM270-10', price: null, stock: 12 },
      { name: 'Color', value: 'Black/White', sku: 'NK-AM270-BW', price: null, stock: 30 },
      { name: 'Color', value: 'Blue Void', sku: 'NK-AM270-BV', price: null, stock: 20 },
    ],
    stock: 65,
    isFeatured: true,
    tags: 'shoes,nike,running,sports,air-max,men',
    specifications: JSON.stringify({
      Type: 'Running Shoes',
      Upper: 'Mesh + Synthetic',
      Sole: 'Rubber',
      Cushioning: 'Max Air 270 Unit',
      Closure: 'Lace-up',
      Weight: '310g per shoe',
    }),
    seoTitle: 'Nike Air Max 270 Running Shoes - Buy Online | MeraShop',
    seoDescription: 'Shop Nike Air Max 270 at best price in India. Free delivery, easy returns on MeraShop!',
    weight: 620,
    shippingFree: true,
    returnPolicy: '15 days',
    totalSold: 340,
    avgRating: 4.5,
    reviewCount: 178,
  })

  // --- Fashion: Women ---
  const hmDress = await createProduct({
    name: 'H&M Women Ribbed Knit Midi Dress',
    slug: 'hm-women-ribbed-knit-midi-dress',
    description:
      'Stay stylish and comfortable with this H&M ribbed knit midi dress. Featuring a flattering bodycon fit, round neckline, and long sleeves. Made from soft, stretchy fabric that moves with you. Perfect for casual outings, brunches, and weekend plans.',
    shortDescription: 'Soft ribbed knit midi dress with bodycon fit',
    categoryId: womenFashion.id,
    brandId: brandRecords['hm'].id,
    basePrice: 2999,
    salePrice: 1799,
    sku: 'HM-WDR-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop', altText: 'H&M Midi Dress', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop', altText: 'H&M Dress Detail', isPrimary: false, sortOrder: 1 },
    ],
    variants: [
      { name: 'Size', value: 'XS', sku: 'HM-WDR-XS', price: null, stock: 10 },
      { name: 'Size', value: 'S', sku: 'HM-WDR-S', price: null, stock: 20 },
      { name: 'Size', value: 'M', sku: 'HM-WDR-M', price: null, stock: 25 },
      { name: 'Size', value: 'L', sku: 'HM-WDR-L', price: null, stock: 18 },
      { name: 'Color', value: 'Black', sku: 'HM-WDR-BK', price: null, stock: 35 },
      { name: 'Color', value: 'Beige', sku: 'HM-WDR-BG', price: null, stock: 25 },
    ],
    stock: 73,
    isNewArrival: true,
    tags: 'dress,women,h&m,casual,knit,midi',
    specifications: JSON.stringify({
      Fabric: 'Ribbed Knit (Cotton + Elastane)',
      Fit: 'Bodycon',
      Length: 'Midi',
      Neckline: 'Round Neck',
      Sleeves: 'Long Sleeve',
      WashCare: 'Machine Wash Cold',
    }),
    seoTitle: 'H&M Women Ribbed Knit Midi Dress - Buy Online | MeraShop',
    seoDescription: 'Shop H&M midi dresses at 40% off. Trendy styles, free delivery on MeraShop!',
    weight: 280,
    shippingFree: true,
    returnPolicy: '15 days',
    totalSold: 156,
    avgRating: 4.4,
    reviewCount: 67,
  })

  const adidasUltraboost = await createProduct({
    name: 'Adidas Ultraboost Light Running Shoes Women',
    slug: 'adidas-ultraboost-light-running-shoes-women',
    description:
      'The lightest Ultraboost ever. Adidas Ultraboost Light features Light BOOST cushioning for incredible energy return, Primeknit+ upper for adaptive support, and Continental rubber outsole for superior grip. Perfect for daily runs and active lifestyles.',
    shortDescription: 'Lightest Ultraboost with Light BOOST cushioning',
    categoryId: womenFashion.id,
    brandId: brandRecords['adidas'].id,
    basePrice: 16999,
    salePrice: 11999,
    sku: 'ADI-UBL-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', altText: 'Adidas Ultraboost Light', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop', altText: 'Adidas Ultraboost Side', isPrimary: false, sortOrder: 1 },
    ],
    variants: [
      { name: 'Size', value: 'UK 5', sku: 'ADI-UBL-5', price: null, stock: 12 },
      { name: 'Size', value: 'UK 6', sku: 'ADI-UBL-6', price: null, stock: 15 },
      { name: 'Size', value: 'UK 7', sku: 'ADI-UBL-7', price: null, stock: 10 },
      { name: 'Color', value: 'Cloud White', sku: 'ADI-UBL-CW', price: null, stock: 20 },
      { name: 'Color', value: 'Core Black', sku: 'ADI-UBL-CB', price: null, stock: 15 },
    ],
    stock: 37,
    isFeatured: true,
    tags: 'shoes,adidas,running,women,ultraboost,premium',
    specifications: JSON.stringify({
      Type: 'Running Shoes',
      Upper: 'Primeknit+',
      Midsole: 'Light BOOST',
      Outsole: 'Continental Rubber',
      Weight: '270g per shoe',
      Closure: 'Lace-up',
    }),
    seoTitle: 'Adidas Ultraboost Light Women Running Shoes | MeraShop',
    seoDescription: 'Shop Adidas Ultraboost Light for women at best price. Light BOOST technology. Free delivery on MeraShop!',
    weight: 540,
    shippingFree: true,
    returnPolicy: '15 days',
    totalSold: 98,
    avgRating: 4.6,
    reviewCount: 45,
  })

  // --- Home & Kitchen ---
  const prestigeCooker = await createProduct({
    name: 'Prestige Popular Plus 5L Pressure Cooker',
    slug: 'prestige-popular-plus-5l-pressure-cooker',
    description:
      "India's most trusted pressure cooker brand brings you the Popular Plus range. Made from high-quality aluminium with an induction base, this 5-litre pressure cooker is perfect for a family of 4-5. Features a metallic safety plug, gasket release system, and easy-grip handle.",
    shortDescription: '5L aluminium pressure cooker with induction base',
    categoryId: homeKitchen.id,
    brandId: brandRecords['prestige'].id,
    basePrice: 2895,
    salePrice: 1899,
    sku: 'PRE-PP5L-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', altText: 'Prestige Pressure Cooker', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop', altText: 'Prestige Cooker Detail', isPrimary: false, sortOrder: 1 },
    ],
    stock: 150,
    isBestseller: true,
    tags: 'cooker,prestige,kitchen,induction,aluminium',
    specifications: JSON.stringify({
      Capacity: '5 Litres',
      Material: 'Aluminium',
      Base: 'Induction Base',
      'Safety Features': 'Metallic Safety Plug, Gasket Release System',
      Handle: 'Easy Grip',
      SuitableFor: 'Family of 4-5',
      Warranty: '5 Years',
    }),
    seoTitle: 'Prestige Popular Plus 5L Pressure Cooker - Buy Online | MeraShop',
    seoDescription: 'Shop Prestige 5L pressure cooker at best price. Induction base, 5-year warranty. Free delivery on MeraShop!',
    weight: 2100,
    shippingFree: true,
    returnPolicy: '15 days',
    totalSold: 1560,
    avgRating: 4.4,
    reviewCount: 2340,
  })

  const pigeonTawa = await createProduct({
    name: 'Pigeon by Stovekraft Non-Stick Tawa 28cm',
    slug: 'pigeon-non-stick-tawa-28cm',
    description:
      'Cook healthy and delicious meals with Pigeon non-stick tawa. Made with premium aluminium body and 5-layer PFOA-free non-stick coating for oil-free cooking. Cool-touch handle, compatible with gas and induction cooktops. Perfect for rotis, dosas, parathas, and more.',
    shortDescription: 'Non-stick tawa with PFOA-free coating, 28cm',
    categoryId: homeKitchen.id,
    brandId: brandRecords['pigeon'].id,
    basePrice: 1199,
    salePrice: 599,
    sku: 'PIG-NSH28-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', altText: 'Pigeon Non-stick Tawa', isPrimary: true, sortOrder: 0 },
    ],
    stock: 200,
    isBestseller: true,
    tags: 'tawa,non-stick,kitchen,pigeon,induction',
    specifications: JSON.stringify({
      Diameter: '28 cm',
      Material: 'Aluminium',
      Coating: '5-Layer PFOA-free Non-stick',
      Handle: 'Cool-touch Bakelite',
      Compatible: 'Gas & Induction',
      Warranty: '1 Year',
    }),
    seoTitle: 'Pigeon Non-Stick Tawa 28cm - Buy Online | MeraShop',
    seoDescription: 'Shop Pigeon non-stick tawa at just ₹599. PFOA-free coating. Free delivery on MeraShop!',
    weight: 650,
    shippingFree: true,
    returnPolicy: '15 days',
    totalSold: 3420,
    avgRating: 4.1,
    reviewCount: 5670,
  })

  // --- Beauty ---
  const mamaearthFaceWash = await createProduct({
    name: 'Mamaearth Vitamin C Face Wash',
    slug: 'mamaearth-vitamin-c-face-wash',
    description:
      'Brighten your skin with Mamaearth Vitamin C Face Wash. Enriched with Vitamin C and Turmeric, this toxin-free face wash deeply cleanses, removes dirt & impurities, and gives a natural glow. Suitable for all skin types. Made safe with no harmful chemicals.',
    shortDescription: 'Toxin-free face wash with Vitamin C & Turmeric',
    categoryId: beauty.id,
    brandId: brandRecords['mamaearth'].id,
    basePrice: 399,
    salePrice: 299,
    sku: 'MAM-VCFW-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', altText: 'Mamaearth Vitamin C Face Wash', isPrimary: true, sortOrder: 0 },
    ],
    variants: [
      { name: 'Size', value: '100ml', sku: 'MAM-VCFW-100', price: null, stock: 300 },
      { name: 'Size', value: '150ml', sku: 'MAM-VCFW-150', price: 399, stock: 200 },
    ],
    stock: 500,
    isBestseller: true,
    tags: 'facewash,beauty,mamaearth,vitamin-c,skincare',
    specifications: JSON.stringify({
      'Key Ingredients': 'Vitamin C, Turmeric',
      'Skin Type': 'All Skin Types',
      Volume: '100ml / 150ml',
      'Free From': 'Toxins, Parabens, Sulphates',
      'Made Safe': 'Yes',
      DermatologicallyTested: 'Yes',
    }),
    seoTitle: 'Mamaearth Vitamin C Face Wash - Buy Online | MeraShop',
    seoDescription: 'Shop Mamaearth Vitamin C Face Wash at best price. Toxin-free, natural glow. Free delivery on MeraShop!',
    weight: 120,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 8920,
    avgRating: 4.2,
    reviewCount: 12400,
  })

  const bombayShaving = await createProduct({
    name: 'Bombay Shaving Company Complete Grooming Kit',
    slug: 'bombay-shaving-company-complete-grooming-kit',
    description:
      "Elevate your grooming game with the Bombay Shaving Company Complete Kit. Includes precision razor with 6-blade refills, shaving cream, after-shave balm, face wash, and charcoal face scrub. Premium quality men's grooming essentials in one stylish box.",
    shortDescription: 'Premium men grooming kit with razor, cream & skincare',
    categoryId: beauty.id,
    brandId: brandRecords['bombay-shaving-company'].id,
    basePrice: 2499,
    salePrice: 1499,
    sku: 'BSC-CGK-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', altText: 'Bombay Shaving Company Kit', isPrimary: true, sortOrder: 0 },
    ],
    stock: 80,
    isFeatured: true,
    isNewArrival: true,
    tags: 'grooming,shaving,men,bombay-shaving,skincare,kit',
    specifications: JSON.stringify({
      Includes: 'Razor, 6 Blade Refills, Shaving Cream, After-Shave Balm, Face Wash, Charcoal Scrub',
      'Skin Type': 'All Skin Types',
      'Free From': 'Parabens, Sulphates',
      Packaging: 'Gift Box',
    }),
    seoTitle: 'Bombay Shaving Company Grooming Kit - Buy Online | MeraShop',
    seoDescription: 'Shop Bombay Shaving Company complete grooming kit at 40% off. Premium men grooming. Free delivery on MeraShop!',
    weight: 450,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 560,
    avgRating: 4.5,
    reviewCount: 312,
  })

  // --- Sports & Fitness ---
  const pumaRunning = await createProduct({
    name: 'Puma Men Softride Running Shoes',
    slug: 'puma-men-softride-running-shoes',
    description:
      'Hit the ground running with Puma Softride. Featuring SoftRide technology for superior cushioning, breathable mesh upper, and durable rubber outsole. These lightweight running shoes provide excellent support and comfort for daily training and casual runs.',
    shortDescription: 'Lightweight running shoes with SoftRide cushioning',
    categoryId: sports.id,
    brandId: brandRecords['puma'].id,
    basePrice: 7999,
    salePrice: 4499,
    sku: 'PUM-SR-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', altText: 'Puma Softride Running Shoes', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop', altText: 'Puma Softride Side', isPrimary: false, sortOrder: 1 },
    ],
    variants: [
      { name: 'Size', value: 'UK 7', sku: 'PUM-SR-7', price: null, stock: 18 },
      { name: 'Size', value: 'UK 8', sku: 'PUM-SR-8', price: null, stock: 22 },
      { name: 'Size', value: 'UK 9', sku: 'PUM-SR-9', price: null, stock: 20 },
      { name: 'Size', value: 'UK 10', sku: 'PUM-SR-10', price: null, stock: 15 },
      { name: 'Color', value: 'Peacoat/Red', sku: 'PUM-SR-PR', price: null, stock: 35 },
    ],
    stock: 75,
    tags: 'shoes,puma,running,sports,fitness,men',
    specifications: JSON.stringify({
      Type: 'Running Shoes',
      Upper: 'Breathable Mesh',
      Midsole: 'SoftRide Technology',
      Outsole: 'Rubber',
      Weight: '290g per shoe',
      Closure: 'Lace-up',
    }),
    seoTitle: 'Puma Softride Running Shoes - Buy Online | MeraShop',
    seoDescription: 'Shop Puma Softride running shoes at 44% off. SoftRide cushioning technology. Free delivery on MeraShop!',
    weight: 580,
    shippingFree: true,
    returnPolicy: '15 days',
    totalSold: 430,
    avgRating: 4.3,
    reviewCount: 256,
  })

  // --- Books ---
  const atomicHabits = await createProduct({
    name: 'Atomic Habits by James Clear',
    slug: 'atomic-habits-james-clear',
    description:
      "An Easy & Proven Way to Build Good Habits & Break Bad Ones. No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    shortDescription: 'Bestselling book on building good habits & breaking bad ones',
    categoryId: books.id,
    brandId: null,
    basePrice: 799,
    salePrice: 399,
    sku: 'BK-AH-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop', altText: 'Atomic Habits Book Cover', isPrimary: true, sortOrder: 0 },
    ],
    stock: 250,
    isFeatured: true,
    isBestseller: true,
    tags: 'book,self-help,habits,bestseller,james-clear',
    specifications: JSON.stringify({
      Author: 'James Clear',
      Publisher: 'Avery',
      Pages: '320',
      Language: 'English',
      ISBN: '978-0735211292',
      Format: 'Paperback',
    }),
    seoTitle: 'Atomic Habits by James Clear - Buy Online | MeraShop',
    seoDescription: 'Shop Atomic Habits by James Clear at 50% off. Bestselling self-help book. Free delivery on MeraShop!',
    weight: 280,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 3200,
    avgRating: 4.8,
    reviewCount: 5600,
  })

  // --- Home & Kitchen: Appliances ---
  const bajajMixer = await createProduct({
    name: 'Bajaj Rex 500W Mixer Grinder',
    slug: 'bajaj-rex-500w-mixer-grinder',
    description:
      "Make your kitchen tasks easier with Bajaj Rex mixer grinder. Powerful 500W motor, 3 stainless steel jars (1.5L, 1.0L, 0.3L), 3-speed control with pulse function. Compact design, easy to clean, and built to last. A must-have for every Indian kitchen.",
    shortDescription: '500W mixer grinder with 3 stainless steel jars',
    categoryId: homeKitchen.id,
    brandId: brandRecords['bajaj'].id,
    basePrice: 3499,
    salePrice: 2199,
    sku: 'BAJ-REX-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', altText: 'Bajaj Mixer Grinder', isPrimary: true, sortOrder: 0 },
    ],
    stock: 90,
    isBestseller: true,
    tags: 'mixer,grinder,bajaj,kitchen,appliance',
    specifications: JSON.stringify({
      Power: '500W',
      Jars: '3 Stainless Steel (1.5L, 1.0L, 0.3L)',
      Speed: '3 Speed + Pulse',
      Motor: 'Powerful 500W',
      Body: 'ABS Plastic',
      Warranty: '2 Years',
    }),
    seoTitle: 'Bajaj Rex 500W Mixer Grinder - Buy Online | MeraShop',
    seoDescription: 'Shop Bajaj Rex mixer grinder at best price. 500W motor, 3 jars. Free delivery on MeraShop!',
    weight: 3500,
    shippingFree: true,
    returnPolicy: '15 days',
    totalSold: 980,
    avgRating: 4.1,
    reviewCount: 1560,
  })

  // --- Fashion: Levis Jeans ---
  const levisJeans = await createProduct({
    name: "Levi's Men 511 Slim Fit Jeans",
    slug: 'levis-men-511-slim-fit-jeans',
    description:
      "The iconic Levi's 511 Slim Fit Jeans. A modern slim fit with a streamlined leg that sits below the waist. Made from premium stretch denim for comfort and style. Features classic 5-pocket styling, zip fly, and the signature Levi's leather patch.",
    shortDescription: 'Classic slim fit jeans with stretch denim',
    categoryId: menFashion.id,
    brandId: brandRecords['levis'].id,
    basePrice: 4999,
    salePrice: 2799,
    sku: 'LEV-511-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', altText: "Levi's 511 Slim Fit Jeans", isPrimary: true, sortOrder: 0 },
    ],
    variants: [
      { name: 'Size', value: '30', sku: 'LEV-511-30', price: null, stock: 20 },
      { name: 'Size', value: '32', sku: 'LEV-511-32', price: null, stock: 25 },
      { name: 'Size', value: '34', sku: 'LEV-511-34', price: null, stock: 22 },
      { name: 'Size', value: '36', sku: 'LEV-511-36', price: null, stock: 15 },
      { name: 'Color', value: 'Mid Indigo', sku: 'LEV-511-MI', price: null, stock: 40 },
      { name: 'Color', value: 'Black', sku: 'LEV-511-BK', price: null, stock: 30 },
    ],
    stock: 82,
    tags: 'jeans,levis,men,denim,slim-fit',
    specifications: JSON.stringify({
      Fit: 'Slim Fit',
      Rise: 'Below Waist',
      Fabric: 'Stretch Denim (98% Cotton, 2% Elastane)',
      Closure: 'Zip Fly',
      Pockets: '5 Pocket Styling',
      WashCare: 'Machine Wash Cold',
    }),
    seoTitle: "Levi's Men 511 Slim Fit Jeans - Buy Online | MeraShop",
    seoDescription: "Shop Levi's 511 slim fit jeans at 44% off. Premium stretch denim. Free delivery on MeraShop!",
    weight: 680,
    shippingFree: true,
    returnPolicy: '15 days',
    totalSold: 560,
    avgRating: 4.4,
    reviewCount: 312,
  })

  // --- Grocery ---
  const organicHoney = await createProduct({
    name: 'Organic India Raw Honey 500g',
    slug: 'organic-india-raw-honey-500g',
    description:
      'Pure, raw, and unprocessed honey from Organic India. Sourced from natural beekeepers, this honey retains all its natural enzymes, vitamins, and minerals. No additives, no preservatives. Perfect for daily consumption, cooking, and Ayurvedic remedies.',
    shortDescription: 'Pure unprocessed raw honey, 500g bottle',
    categoryId: grocery.id,
    brandId: null,
    basePrice: 599,
    salePrice: 449,
    sku: 'OI-RH-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop', altText: 'Organic Raw Honey', isPrimary: true, sortOrder: 0 },
    ],
    stock: 300,
    tags: 'honey,organic,grocery,healthy,natural',
    specifications: JSON.stringify({
      Weight: '500g',
      Type: 'Raw & Unprocessed',
      Source: 'Natural Beekeepers',
      'Free From': 'Additives, Preservatives',
      Certification: 'Organic Certified',
    }),
    seoTitle: 'Organic India Raw Honey 500g - Buy Online | MeraShop',
    seoDescription: 'Shop Organic India raw honey at best price. Pure, unprocessed. Free delivery on MeraShop!',
    weight: 550,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 1200,
    avgRating: 4.5,
    reviewCount: 890,
  })

  // --- Philips Trimmer ---
  const philipsTrimmer = await createProduct({
    name: 'Philips BT1210 Beard Trimmer',
    slug: 'philips-bt1210-beard-trimmer',
    description:
      "Get the perfect beard with Philips BT1210 trimmer. Features self-sharpening stainless steel blades, 8 length settings (1-15mm), 45 minutes cordless use, and USB charging. Skin-friendly blades ensure no nicks or cuts. Compact design perfect for travel.",
    shortDescription: 'Cordless beard trimmer with 8 length settings',
    categoryId: beauty.id,
    brandId: brandRecords['philips'].id,
    basePrice: 1995,
    salePrice: 1095,
    sku: 'PHI-BT1210-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', altText: 'Philips Beard Trimmer', isPrimary: true, sortOrder: 0 },
    ],
    stock: 120,
    isBestseller: true,
    tags: 'trimmer,philips,beard,grooming,men',
    specifications: JSON.stringify({
      Blades: 'Self-sharpening Stainless Steel',
      'Length Settings': '8 (1-15mm)',
      'Cordless Use': '45 minutes',
      Charging: 'USB',
      'Water Resistant': 'Yes (Washable)',
      Warranty: '2 Years',
    }),
    seoTitle: 'Philips BT1210 Beard Trimmer - Buy Online | MeraShop',
    seoDescription: 'Shop Philips BT1210 trimmer at best price. 8 length settings, USB charging. Free delivery on MeraShop!',
    weight: 190,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 2340,
    avgRating: 4.3,
    reviewCount: 4560,
  })

  // --- Havells Fan ---
  const havellsFan = await createProduct({
    name: 'Havells Festiva Decorative Ceiling Fan',
    slug: 'havells-festiva-decorative-ceiling-fan',
    description:
      'Add elegance to your room with Havells Festiva decorative ceiling fan. Features decorative ring design, powerful motor, and energy-efficient performance. Sweep size 1200mm, perfect for medium to large rooms. Comes with remote control for convenient operation.',
    shortDescription: 'Decorative ceiling fan with remote control, 1200mm',
    categoryId: homeKitchen.id,
    brandId: brandRecords['havells'].id,
    basePrice: 5495,
    salePrice: 3899,
    sku: 'HAV-FES-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', altText: 'Havells Ceiling Fan', isPrimary: true, sortOrder: 0 },
    ],
    stock: 45,
    tags: 'fan,havells,ceiling,decorative,home',
    specifications: JSON.stringify({
      Sweep: '1200mm',
      Speed: '350 RPM',
      'Power Consumption': '75W',
      Motor: 'Powerful Copper Motor',
      Remote: 'Yes',
      Warranty: '2 Years',
    }),
    seoTitle: 'Havells Festiva Decorative Ceiling Fan - Buy Online | MeraShop',
    seoDescription: 'Shop Havells Festiva ceiling fan with remote at best price. Free delivery & installation on MeraShop!',
    weight: 4500,
    shippingFree: true,
    returnPolicy: '15 days',
    totalSold: 320,
    avgRating: 4.2,
    reviewCount: 210,
  })

  // --- Dell Laptop ---
  const dellInspiron = await createProduct({
    name: 'Dell Inspiron 15 i5 13th Gen Laptop',
    slug: 'dell-inspiron-15-i5-13th-gen-laptop',
    description:
      'Power through your workday with Dell Inspiron 15. Equipped with 13th Gen Intel Core i5 processor, 16GB RAM, 512GB SSD, and Intel Iris Xe graphics. 15.6" FHD display, spill-resistant keyboard, and all-day battery life make it perfect for professionals and students.',
    shortDescription: 'Work laptop with i5 13th Gen, 16GB RAM & 512GB SSD',
    categoryId: laptops.id,
    brandId: brandRecords['dell'].id,
    basePrice: 82999,
    salePrice: 64999,
    sku: 'DEL-INS15-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', altText: 'Dell Inspiron 15', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=400&fit=crop', altText: 'Dell Inspiron Side', isPrimary: false, sortOrder: 1 },
    ],
    stock: 25,
    isNewArrival: true,
    tags: 'laptop,dell,inspiron,i5,student,office',
    specifications: JSON.stringify({
      Display: '15.6" FHD IPS, 1920x1080',
      Processor: 'Intel Core i5-1335U',
      RAM: '16GB DDR4',
      Storage: '512GB SSD',
      Graphics: 'Intel Iris Xe',
      Battery: 'Up to 8 hours',
      Weight: '1.65 kg',
      OS: 'Windows 11 Home',
    }),
    seoTitle: 'Dell Inspiron 15 i5 13th Gen Laptop - Buy Online | MeraShop',
    seoDescription: 'Shop Dell Inspiron 15 laptop with i5 13th Gen at best price. Student discounts on MeraShop!',
    weight: 1650,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 145,
    avgRating: 4.3,
    reviewCount: 89,
  })

  // --- Van Heusen Blazer ---
  const vanHeusenBlazer = await createProduct({
    name: 'Van Heusen Men Slim Fit Blazer',
    slug: 'van-heusen-men-slim-fit-blazer',
    description:
      "Make a lasting impression with the Van Heusen slim fit blazer. Tailored from premium fabric with a modern slim silhouette, this blazer features a notch lapel, two-button closure, and interior pockets. Perfect for business meetings, formal events, and smart casual occasions.",
    shortDescription: 'Premium slim fit blazer for formal & smart casual',
    categoryId: menFashion.id,
    brandId: brandRecords['van-heusen'].id,
    basePrice: 6999,
    salePrice: 4199,
    sku: 'VH-MBL-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop', altText: 'Van Heusen Blazer', isPrimary: true, sortOrder: 0 },
    ],
    variants: [
      { name: 'Size', value: 'S', sku: 'VH-MBL-S', price: null, stock: 8 },
      { name: 'Size', value: 'M', sku: 'VH-MBL-M', price: null, stock: 12 },
      { name: 'Size', value: 'L', sku: 'VH-MBL-L', price: null, stock: 10 },
      { name: 'Size', value: 'XL', sku: 'VH-MBL-XL', price: null, stock: 7 },
      { name: 'Color', value: 'Navy Blue', sku: 'VH-MBL-NB', price: null, stock: 20 },
      { name: 'Color', value: 'Charcoal Grey', sku: 'VH-MBL-CG', price: null, stock: 15 },
    ],
    stock: 37,
    isFeatured: true,
    tags: 'blazer,van-heusen,men,formal,premium',
    specifications: JSON.stringify({
      Fabric: 'Polyester Blend',
      Fit: 'Slim Fit',
      Lapel: 'Notch Lapel',
      Closure: 'Two-Button',
      Lining: 'Full Lined',
      Occasion: 'Formal / Smart Casual',
    }),
    seoTitle: 'Van Heusen Men Slim Fit Blazer - Buy Online | MeraShop',
    seoDescription: 'Shop Van Heusen slim fit blazer at 40% off. Premium fabric, modern fit. Free delivery on MeraShop!',
    weight: 700,
    shippingFree: true,
    returnPolicy: '15 days',
    totalSold: 210,
    avgRating: 4.4,
    reviewCount: 95,
  })

  // --- Lenovo Tab ---
  const lenovoTab = await createProduct({
    name: 'Lenovo Tab M10 3rd Gen 10.1" Tablet',
    slug: 'lenovo-tab-m10-3rd-gen-tablet',
    description:
      'Entertainment meets productivity with Lenovo Tab M10. Features a 10.1" FHD display, Snapdragon 680 processor, 4GB RAM, 64GB storage, and dual speakers with Dolby Atmos. Kid-friendly mode and reading mode make it perfect for the whole family.',
    shortDescription: '10.1" FHD tablet with Dolby Atmos & kid mode',
    categoryId: electronics.id,
    brandId: brandRecords['lenovo'].id,
    basePrice: 19999,
    salePrice: 13999,
    sku: 'LEN-TM10-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop', altText: 'Lenovo Tab M10', isPrimary: true, sortOrder: 0 },
    ],
    stock: 40,
    isNewArrival: true,
    tags: 'tablet,lenovo,android,family,entertainment',
    specifications: JSON.stringify({
      Display: '10.1" FHD IPS, 1920x1200',
      Processor: 'Snapdragon 680',
      RAM: '4GB',
      Storage: '64GB (expandable up to 256GB)',
      Camera: '8MP Rear, 5MP Front',
      Battery: '7700mAh',
      OS: 'Android 12',
    }),
    seoTitle: 'Lenovo Tab M10 3rd Gen Tablet - Buy Online | MeraShop',
    seoDescription: 'Shop Lenovo Tab M10 at best price. 10.1" FHD display, Dolby Atmos. Free delivery on MeraShop!',
    weight: 460,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 280,
    avgRating: 4.2,
    reviewCount: 156,
  })

  // --- Kids Fashion ---
  const kidsTshirt = await createProduct({
    name: 'H&M Kids Printed Cotton T-Shirt Set',
    slug: 'hm-kids-printed-cotton-tshirt-set',
    description:
      'Adorable and comfortable cotton t-shirt set for kids by H&M. Made from soft organic cotton with fun prints. Set includes 2 t-shirts. Easy care, machine washable, and gentle on sensitive skin. Perfect for everyday wear and play time.',
    shortDescription: 'Set of 2 organic cotton t-shirts for kids',
    categoryId: kidsFashion.id,
    brandId: brandRecords['hm'].id,
    basePrice: 1499,
    salePrice: 899,
    sku: 'HM-KTS-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=400&fit=crop', altText: 'Kids T-Shirt Set', isPrimary: true, sortOrder: 0 },
    ],
    variants: [
      { name: 'Size', value: '2-3Y', sku: 'HM-KTS-23', price: null, stock: 30 },
      { name: 'Size', value: '4-5Y', sku: 'HM-KTS-45', price: null, stock: 25 },
      { name: 'Size', value: '6-7Y', sku: 'HM-KTS-67', price: null, stock: 20 },
    ],
    stock: 75,
    tags: 'kids,t-shirt,h&m,cotton,organic',
    specifications: JSON.stringify({
      Fabric: '100% Organic Cotton',
      Set: '2 T-Shirts',
      Fit: 'Regular Fit',
      Neckline: 'Crew Neck',
      WashCare: 'Machine Wash',
    }),
    seoTitle: 'H&M Kids Cotton T-Shirt Set - Buy Online | MeraShop',
    seoDescription: 'Shop H&M kids t-shirt set at 40% off. Organic cotton, fun prints. Free delivery on MeraShop!',
    weight: 180,
    shippingFree: true,
    returnPolicy: '15 days',
    totalSold: 345,
    avgRating: 4.3,
    reviewCount: 123,
  })

  // --- Automotive ---
  const carPhoneHolder = await createProduct({
    name: 'Magnetic Car Phone Mount Holder',
    slug: 'magnetic-car-phone-mount-holder',
    description:
      'Keep your phone secure while driving with this universal magnetic car mount. 360° rotation, strong N52 magnets, one-hand operation, and universal compatibility. Fits all smartphones and car vents. Sleek design that blends with your car interior.',
    shortDescription: 'Universal magnetic car mount with 360° rotation',
    categoryId: automotive.id,
    brandId: null,
    basePrice: 999,
    salePrice: 399,
    sku: 'AUT-MCM-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', altText: 'Car Phone Mount', isPrimary: true, sortOrder: 0 },
    ],
    stock: 200,
    tags: 'car,phone-holder,automotive,magnetic,mount',
    specifications: JSON.stringify({
      Type: 'Magnetic Vent Mount',
      Magnets: 'N52 Strong Magnets',
      Rotation: '360°',
      Compatibility: 'Universal (All Smartphones)',
      Material: 'Aluminum + Silicone',
      Installation: 'Clip-on Vent',
    }),
    seoTitle: 'Magnetic Car Phone Mount - Buy Online | MeraShop',
    seoDescription: 'Shop magnetic car phone mount at just ₹399. N52 magnets, 360° rotation. Free delivery on MeraShop!',
    weight: 80,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 1890,
    avgRating: 4.0,
    reviewCount: 2340,
  })

  // --- Health & Wellness ---
  const healthSupplement = await createProduct({
    name: 'MuscleBlaze Whey Protein 1kg Rich Chocolate',
    slug: 'muscleblaze-whey-protein-1kg-rich-chocolate',
    description:
      'Fuel your fitness journey with MuscleBlaze Whey Protein. Each serving provides 24g protein, 5.51g BCAAs, and essential amino acids for muscle recovery and growth. Rich chocolate flavor that tastes amazing. Lab tested for purity and authenticity.',
    shortDescription: '24g protein per serving, rich chocolate flavour',
    categoryId: health.id,
    brandId: null,
    basePrice: 3499,
    salePrice: 2499,
    sku: 'HW-MBWP-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2c713?w=400&h=400&fit=crop', altText: 'Whey Protein', isPrimary: true, sortOrder: 0 },
    ],
    variants: [
      { name: 'Flavor', value: 'Rich Chocolate', sku: 'HW-MBWP-RC', price: null, stock: 80 },
      { name: 'Flavor', value: 'Vanilla', sku: 'HW-MBWP-VN', price: null, stock: 50 },
      { name: 'Size', value: '1kg', sku: 'HW-MBWP-1KG', price: null, stock: 100 },
      { name: 'Size', value: '2kg', sku: 'HW-MBWP-2KG', price: 4499, stock: 30 },
    ],
    stock: 130,
    isBestseller: true,
    tags: 'protein,whey,fitness,muscleblaze,health,supplement',
    specifications: JSON.stringify({
      'Protein Per Serving': '24g',
      BCAAs: '5.51g',
      Servings: '33 per kg',
      Flavor: 'Rich Chocolate / Vanilla',
      Form: 'Powder',
      Certification: 'Lab Tested',
    }),
    seoTitle: 'MuscleBlaze Whey Protein 1kg - Buy Online | MeraShop',
    seoDescription: 'Shop MuscleBlaze whey protein at best price. 24g protein per serving. Free delivery on MeraShop!',
    weight: 1050,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 2800,
    avgRating: 4.3,
    reviewCount: 5600,
  })

  // --- Toys & Baby ---
  const babyKit = await createProduct({
    name: 'Baby Care Essentials Gift Set',
    slug: 'baby-care-essentials-gift-set',
    description:
      'Complete baby care gift set including baby lotion, baby wash, baby oil, diaper cream, and baby powder. Made with gentle, natural ingredients. Dermatologically tested and suitable for newborns. Beautifully packaged for gifting.',
    shortDescription: '5-piece baby care set with natural ingredients',
    categoryId: toysBaby.id,
    brandId: brandRecords['mamaearth'].id,
    basePrice: 1999,
    salePrice: 1399,
    sku: 'TB-BCE-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop', altText: 'Baby Care Gift Set', isPrimary: true, sortOrder: 0 },
    ],
    stock: 60,
    tags: 'baby,care,gift-set,newborn,gentle',
    specifications: JSON.stringify({
      Includes: 'Baby Lotion, Baby Wash, Baby Oil, Diaper Cream, Baby Powder',
      Ingredients: 'Natural & Gentle',
      SuitableFor: 'Newborns & Babies',
      DermatologicallyTested: 'Yes',
      Packaging: 'Gift Box',
    }),
    seoTitle: 'Baby Care Essentials Gift Set - Buy Online | MeraShop',
    seoDescription: 'Shop baby care gift set at 30% off. Natural ingredients, newborn safe. Free delivery on MeraShop!',
    weight: 800,
    shippingFree: true,
    returnPolicy: '15 days',
    totalSold: 670,
    avgRating: 4.5,
    reviewCount: 345,
  })

  // --- boAt Headphones ---
  const boAtHeadphones = await createProduct({
    name: 'boAt Rockerz 550 Over-Ear Headphones',
    slug: 'boat-rockerz-550-over-ear-headphones',
    description:
      "Immerse yourself in premium sound with boAt Rockerz 550. Features 50mm dynamic drivers, padded ear cushions for comfort, Bluetooth 5.0, and up to 20 hours playback. Built-in microphone for hands-free calls. Stylish design that's perfect for music lovers.",
    shortDescription: 'Over-ear headphones with 50mm drivers & 20H playback',
    categoryId: audio.id,
    brandId: brandRecords['boat'].id,
    basePrice: 2990,
    salePrice: 1499,
    sku: 'BOAT-R550-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', altText: 'boAt Rockerz 550 Headphones', isPrimary: true, sortOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop', altText: 'boAt Headphones Detail', isPrimary: false, sortOrder: 1 },
    ],
    variants: [
      { name: 'Color', value: 'Buoyant Black', sku: 'BOAT-R550-BB', price: null, stock: 60 },
      { name: 'Color', value: 'Luscious Lemon', sku: 'BOAT-R550-LL', price: null, stock: 40 },
    ],
    stock: 100,
    isBestseller: true,
    tags: 'headphones,boat,audio,bluetooth,over-ear',
    specifications: JSON.stringify({
      Driver: '50mm Dynamic',
      Connectivity: 'Bluetooth 5.0 + AUX',
      Battery: 'Up to 20 hours',
      Features: 'Built-in Mic, Padded Cushions',
      Weight: '185g',
    }),
    seoTitle: 'boAt Rockerz 550 Headphones - Buy Online | MeraShop',
    seoDescription: 'Shop boAt Rockerz 550 headphones at 50% off. 50mm drivers, 20H battery. Free delivery on MeraShop!',
    weight: 185,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 3200,
    avgRating: 4.2,
    reviewCount: 6780,
  })

  // --- Lenovo Laptop ---
  const lenovoIdeaPad = await createProduct({
    name: 'Lenovo IdeaPad Slim 3 i5 12th Gen',
    slug: 'lenovo-ideapad-slim-3-i5-12th-gen',
    description:
      'Sleek and powerful, the Lenovo IdeaPad Slim 3 features 12th Gen Intel Core i5, 16GB RAM, 512GB SSD, and a 15.6" FHD anti-glare display. Lightweight at 1.7kg with rapid charge technology. Perfect for students and working professionals.',
    shortDescription: 'Slim laptop with i5 12th Gen, 16GB RAM & rapid charge',
    categoryId: laptops.id,
    brandId: brandRecords['lenovo'].id,
    basePrice: 74999,
    salePrice: 55990,
    sku: 'LEN-IPS3-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', altText: 'Lenovo IdeaPad Slim 3', isPrimary: true, sortOrder: 0 },
    ],
    stock: 20,
    tags: 'laptop,lenovo,ideapad,student,office,slim',
    specifications: JSON.stringify({
      Display: '15.6" FHD Anti-glare, 1920x1080',
      Processor: 'Intel Core i5-1235U',
      RAM: '16GB DDR4',
      Storage: '512GB SSD',
      Graphics: 'Intel Iris Xe',
      Battery: 'Up to 7 hours, Rapid Charge',
      Weight: '1.7 kg',
      OS: 'Windows 11 Home',
    }),
    seoTitle: 'Lenovo IdeaPad Slim 3 i5 12th Gen - Buy Online | MeraShop',
    seoDescription: 'Shop Lenovo IdeaPad Slim 3 at best price. i5 12th Gen, 16GB RAM. Student offers on MeraShop!',
    weight: 1700,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 178,
    avgRating: 4.3,
    reviewCount: 134,
  })

  // --- Xiaomi Earbuds ---
  const xiaomiEarbuds = await createProduct({
    name: 'Xiaomi Redmi Buds 5 Pro TWS',
    slug: 'xiaomi-redmi-buds-5-pro-tws',
    description:
      'Experience premium audio with Redmi Buds 5 Pro. Features 46dB hybrid ANC, LDAC Hi-Res audio, 10mm dynamic driver, and up to 38H total playback. Dual-device connection, low latency mode for gaming, and IP54 water resistance.',
    shortDescription: 'TWS earbuds with 46dB ANC & LDAC Hi-Res audio',
    categoryId: audio.id,
    brandId: brandRecords['xiaomi'].id,
    basePrice: 4999,
    salePrice: 2999,
    sku: 'XIA-RB5P-001',
    images: [
      { url: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop', altText: 'Xiaomi Redmi Buds 5 Pro', isPrimary: true, sortOrder: 0 },
    ],
    variants: [
      { name: 'Color', value: 'White', sku: 'XIA-RB5P-WH', price: null, stock: 60 },
      { name: 'Color', value: 'Black', sku: 'XIA-RB5P-BK', price: null, stock: 50 },
    ],
    stock: 110,
    isNewArrival: true,
    tags: 'earbuds,tws,xiaomi,redmi,anc,ldac',
    specifications: JSON.stringify({
      Driver: '10mm Dynamic',
      ANC: '46dB Hybrid ANC',
      Audio: 'LDAC Hi-Res',
      Battery: '38H total, 10H earbuds',
      Connectivity: 'Bluetooth 5.3',
      Resistance: 'IP54',
    }),
    seoTitle: 'Xiaomi Redmi Buds 5 Pro TWS - Buy Online | MeraShop',
    seoDescription: 'Shop Redmi Buds 5 Pro with 46dB ANC at best price. LDAC Hi-Res audio. Free delivery on MeraShop!',
    weight: 52,
    shippingFree: true,
    returnPolicy: '7 days',
    totalSold: 560,
    avgRating: 4.4,
    reviewCount: 345,
  })

  console.log(`✅ Created 30 products with images and variants\n`)

  // ============================================
  // STEP 5: Create Users
  // ============================================
  console.log('👤 Creating users...')

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@merashop.in',
      name: 'Admin User',
      phone: '+919876543210',
      role: 'admin',
      isActive: true,
      emailVerified: true,
    },
  })

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      name: 'Priya Sharma',
      phone: '+919123456789',
      role: 'customer',
      isActive: true,
      emailVerified: true,
    },
  })

  // Add customer address
  const customerAddress = await prisma.address.create({
    data: {
      userId: customerUser.id,
      label: 'Home',
      name: 'Priya Sharma',
      phone: '+919123456789',
      addressLine1: '42, Sector 15, Vashi',
      addressLine2: 'Near NIFT Campus',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400703',
      country: 'India',
      isDefault: true,
    },
  })

  console.log('✅ Created admin and customer users\n')

  // ============================================
  // STEP 6: Create Sample Order
  // ============================================
  console.log('🛒 Creating sample order...')

  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: 'MS-2024-001',
      userId: customerUser.id,
      status: 'delivered',
      shippingName: customerAddress.name,
      shippingPhone: customerAddress.phone,
      shippingAddress1: customerAddress.addressLine1,
      shippingAddress2: customerAddress.addressLine2,
      shippingCity: customerAddress.city,
      shippingState: customerAddress.state,
      shippingPincode: customerAddress.pincode,
      shippingCountry: customerAddress.country,
      subtotal: 4297,
      shippingCost: 0,
      discountAmount: 0,
      taxAmount: 774.46,
      totalAmount: 5071.46,
      estimatedDelivery: '2024-12-20',
      deliveredAt: new Date('2024-12-19'),
      trackingNumber: 'DTDC123456789',
      items: {
        create: [
          {
            productId: boAtAirdopes.id,
            productName: 'boAt Airdopes 141 TWS Earbuds',
            productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400',
            quantity: 1,
            unitPrice: 1299,
            totalPrice: 1299,
          },
          {
            productId: mamaearthFaceWash.id,
            productName: 'Mamaearth Vitamin C Face Wash',
            productImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
            quantity: 2,
            unitPrice: 299,
            totalPrice: 598,
          },
          {
            productId: pigeonTawa.id,
            productName: 'Pigeon by Stovekraft Non-Stick Tawa 28cm',
            productImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
            quantity: 1,
            unitPrice: 599,
            totalPrice: 599,
          },
          {
            productId: philipsTrimmer.id,
            productName: 'Philips BT1210 Beard Trimmer',
            productImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
            quantity: 1,
            unitPrice: 1095,
            totalPrice: 1095,
          },
          {
            productId: atomicHabits.id,
            productName: 'Atomic Habits by James Clear',
            productImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
            quantity: 1,
            unitPrice: 399,
            totalPrice: 399,
          },
        ],
      },
    },
  })

  // Create payment for the order
  await prisma.payment.create({
    data: {
      orderId: sampleOrder.id,
      amount: 5071.46,
      currency: 'INR',
      status: 'completed',
      method: 'upi',
      upiId: 'priya@upi',
    },
  })

  // Create a review for the order
  await prisma.review.create({
    data: {
      userId: customerUser.id,
      productId: boAtAirdopes.id,
      rating: 4,
      title: 'Great value for money!',
      comment: 'Amazing sound quality at this price point. Battery life is excellent. ANC works well for the price. Highly recommended for budget buyers!',
      isVerified: true,
      isActive: true,
    },
  })

  await prisma.review.create({
    data: {
      userId: customerUser.id,
      productId: mamaearthFaceWash.id,
      rating: 5,
      title: 'My skin loves it!',
      comment: 'Gentle on skin, leaves face feeling fresh and clean. The Vitamin C really helps brighten my skin. Buying again!',
      isVerified: true,
      isActive: true,
    },
  })

  // Add to wishlist
  await prisma.wishlistItem.create({
    data: {
      userId: customerUser.id,
      productId: samsungGalaxy.id,
    },
  })

  await prisma.wishlistItem.create({
    data: {
      userId: customerUser.id,
      productId: macBookAir.id,
    },
  })

  console.log('✅ Created sample order, payment, reviews, and wishlist\n')

  // ============================================
  // STEP 7: Create Banners
  // ============================================
  console.log('🎨 Creating banners...')

  await prisma.banner.createMany({
    data: [
      {
        title: 'Republic Day Sale - Up to 70% Off!',
        subtitle: 'Celebrate with Mega Deals on Electronics, Fashion & More',
        image: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
        linkUrl: '/sale/republic-day',
        linkText: 'Shop Now',
        position: 'hero',
        sortOrder: 0,
        isActive: true,
        startsAt: new Date('2025-01-20'),
        expiresAt: new Date('2025-01-30'),
      },
      {
        title: 'New Arrivals in Fashion',
        subtitle: 'Trendy styles for the new season | Extra 15% off with code FASHION15',
        image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        linkUrl: '/category/fashion',
        linkText: 'Explore Fashion',
        position: 'hero',
        sortOrder: 1,
        isActive: true,
      },
      {
        title: 'Electronics Fest',
        subtitle: 'Smartphones, Laptops & Gadgets at Lowest Prices',
        image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        linkUrl: '/category/electronics',
        linkText: 'Grab Deals',
        position: 'hero',
        sortOrder: 2,
        isActive: true,
      },
      {
        title: 'Kitchen Appliances Sale',
        subtitle: 'Up to 50% off on Prestige, Pigeon & Bajaj',
        image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        linkUrl: '/category/home-kitchen',
        linkText: 'Shop Kitchen',
        position: 'category',
        sortOrder: 0,
        isActive: true,
      },
      {
        title: 'Free Delivery on ₹499+',
        subtitle: 'No minimum order value for Premium members',
        image: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        linkUrl: '/offers',
        linkText: 'Learn More',
        position: 'sidebar',
        sortOrder: 0,
        isActive: true,
      },
    ],
  })

  console.log('✅ Created 5 banners\n')

  // ============================================
  // STEP 8: Create FAQs
  // ============================================
  console.log('❓ Creating FAQs...')

  await prisma.fAQ.createMany({
    data: [
      {
        question: 'How do I place an order on MeraShop?',
        answer: 'Simply browse our products, add items to your cart, proceed to checkout, enter your delivery address, choose a payment method, and confirm your order. You will receive an order confirmation via email and SMS.',
        category: 'general',
        sortOrder: 1,
        isActive: true,
      },
      {
        question: 'Is it safe to shop on MeraShop?',
        answer: 'Absolutely! MeraShop uses industry-standard 256-bit SSL encryption to protect your personal and payment information. We are PCI DSS compliant and do not store your card details. Your transactions are 100% secure.',
        category: 'general',
        sortOrder: 2,
        isActive: true,
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order is shipped, you will receive a tracking number via email and SMS. You can also track your order by logging into your MeraShop account and visiting the "My Orders" section. We provide real-time tracking updates.',
        category: 'shipping',
        sortOrder: 1,
        isActive: true,
      },
      {
        question: 'What are the delivery charges?',
        answer: 'Delivery is free on orders above ₹499. For orders below ₹499, a flat delivery fee of ₹49 is charged. Express delivery options are available at additional charges. Premium members enjoy free delivery on all orders.',
        category: 'shipping',
        sortOrder: 2,
        isActive: true,
      },
      {
        question: 'How long does delivery take?',
        answer: 'Standard delivery takes 3-7 business days depending on your location. Metro cities usually receive orders within 2-3 days. Express delivery (available in select cities) delivers within 24-48 hours. Delivery times may vary during sales events.',
        category: 'shipping',
        sortOrder: 3,
        isActive: true,
      },
      {
        question: 'What is MeraShop return policy?',
        answer: 'We offer a 7-15 day return policy (varies by product category). Electronics can be returned within 7 days, fashion within 15 days, and groceries are non-returnable. Items must be unused and in original packaging. Refunds are processed within 5-7 business days.',
        category: 'returns',
        sortOrder: 1,
        isActive: true,
      },
      {
        question: 'How do I initiate a return or exchange?',
        answer: 'Go to "My Orders" in your account, select the order you want to return, click "Return/Replace", choose the reason, and submit. Our courier partner will pick up the item from your doorstep. Exchanges are subject to stock availability.',
        category: 'returns',
        sortOrder: 2,
        isActive: true,
      },
      {
        question: 'When will I get my refund?',
        answer: 'Refunds are processed within 1-2 business days after we receive the returned product. The amount will be credited to your original payment method within 5-7 business days. For COD orders, refunds are processed to your bank account or MeraShop wallet.',
        category: 'returns',
        sortOrder: 3,
        isActive: true,
      },
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, Rupay), Net Banking from all major banks, MeraShop Wallet, and Cash on Delivery (COD). EMI options are available on select products for orders above ₹3,000.',
        category: 'payment',
        sortOrder: 1,
        isActive: true,
      },
      {
        question: 'How do I apply a coupon code?',
        answer: 'Add items to your cart, proceed to checkout, and look for the "Apply Coupon" field on the payment page. Enter your coupon code and click "Apply". The discount will be reflected in your order total. Only one coupon can be used per order.',
        category: 'payment',
        sortOrder: 2,
        isActive: true,
      },
      {
        question: 'Is Cash on Delivery (COD) available?',
        answer: 'Yes, COD is available on orders up to ₹50,000. A nominal COD fee of ₹40 may apply. Please keep exact change ready at the time of delivery. COD is not available for some pin codes and high-value items.',
        category: 'payment',
        sortOrder: 3,
        isActive: true,
      },
      {
        question: 'Do you offer EMI options?',
        answer: 'Yes! No-cost EMI is available on select products with participating banks (HDFC, ICICI, Axis, SBI, Kotak). Standard EMI options are available on credit cards for orders above ₹3,000. Tenure options range from 3 to 24 months.',
        category: 'payment',
        sortOrder: 4,
        isActive: true,
      },
    ],
  })

  console.log('✅ Created 12 FAQs\n')

  // ============================================
  // STEP 9: Create Blog Posts
  // ============================================
  console.log('📝 Creating blog posts...')

  await prisma.blogPost.createMany({
    data: [
      {
        title: 'Top 10 Smartphones Under ₹20000 in India - 2025 Buying Guide',
        slug: 'top-10-smartphones-under-20000-india-2025',
        excerpt: 'Looking for the best smartphone under ₹20000? Our comprehensive guide covers the top picks with detailed comparisons, pros & cons, and expert recommendations.',
        content: `<h2>Introduction</h2>
<p>The sub-₹20000 smartphone segment in India is more competitive than ever, with brands like Xiaomi, Realme, Samsung, and Poco offering incredible value. In this guide, we break down the best options available in 2025.</p>

<h2>1. Xiaomi Redmi Note 13 Pro 5G</h2>
<p>With its 200MP camera and Snapdragon 7s Gen 2, the Redmi Note 13 Pro offers flagship-level features at a mid-range price. The 6.67" AMOLED display is stunning, and 67W charging keeps you powered up.</p>

<h2>2. Samsung Galaxy M34 5G</h2>
<p>Samsung's M-series continues to impress with the Galaxy M34. Great display, solid battery life, and Samsung's reliable One UI make this a great choice for Samsung fans on a budget.</p>

<h2>3. Poco X6 Pro 5G</h2>
<p>For performance enthusiasts, the Poco X6 Pro delivers with its Dimensity 8300 Ultra chip. Great for gaming and multitasking, this phone punches well above its weight.</p>

<h2>Key Factors to Consider</h2>
<ul>
<li><strong>Display:</strong> Look for AMOLED panels with 90Hz+ refresh rate</li>
<li><strong>Processor:</strong> Snapdragon 7-series or MediaTek Dimensity 7000+ for best performance</li>
<li><strong>Camera:</strong> 50MP+ main sensor with OIS for best results</li>
<li><strong>Battery:</strong> 5000mAh+ with 33W+ fast charging</li>
<li><strong>Software:</strong> Check for guaranteed OS updates</li>
</ul>

<h2>Conclusion</h2>
<p>The sub-₹20000 segment offers incredible value in 2025. Whether you prioritize camera, performance, or battery life, there's a perfect phone for you. Shop these phones on MeraShop with exclusive deals and EMI options!</p>`,
        coverImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=400&fit=crop',
        category: 'Buying Guide',
        tags: 'smartphones,budget,buying-guide,2025',
        authorName: 'Rahul Verma',
        isPublished: true,
        publishedAt: new Date('2025-01-15'),
        seoTitle: 'Top 10 Smartphones Under ₹20000 in India - 2025 Guide | MeraShop Blog',
        seoDescription: 'Discover the best smartphones under ₹20000 in India. Detailed comparison, specs, and expert recommendations for 2025.',
      },
      {
        title: 'Summer Skincare Routine: Expert Tips for Indian Skin',
        slug: 'summer-skincare-routine-indian-skin-tips',
        excerpt: 'Beat the Indian summer heat with our expert skincare guide. From sunscreen to hydration, learn the perfect summer routine for Indian skin types.',
        content: `<h2>Why Indian Skin Needs Special Summer Care</h2>
<p>Indian summers are harsh, with temperatures soaring above 45°C in many regions. The combination of heat, humidity, and pollution can wreak havoc on your skin. Here's how to protect and nourish your skin this summer.</p>

<h2>Essential Summer Skincare Steps</h2>

<h3>1. Cleanse Gently</h3>
<p>Use a gentle, sulfate-free face wash like the Mamaearth Vitamin C Face Wash. It removes dirt without stripping natural oils. Cleanse twice daily — morning and night.</p>

<h3>2. Never Skip Sunscreen</h3>
<p>This is non-negotiable! Use a broad-spectrum SPF 50+ sunscreen. Reapply every 2-3 hours when outdoors. Look for lightweight, non-greasy formulas that suit Indian skin.</p>

<h3>3. Hydrate, Hydrate, Hydrate</h3>
<p>Use a lightweight, water-based moisturizer even if your skin is oily. Hyaluronic acid serums are great for maintaining moisture without feeling heavy.</p>

<h3>4. Exfoliate Weekly</h3>
<p>Use a gentle chemical exfoliant (AHA/BHA) 1-2 times a week. Avoid harsh scrubs that can damage sun-exposed skin.</p>

<h3>5. Antioxidant Protection</h3>
<p>Vitamin C serums protect against free radical damage from UV and pollution. Apply in the morning before sunscreen for maximum protection.</p>

<h2>Indian Summer Skincare Don'ts</h2>
<ul>
<li>Don't use heavy, oil-based products</li>
<li>Don't skip moisturizer thinking your skin doesn't need it</li>
<li>Don't use lemon juice directly on skin (photosensitivity risk)</li>
<li>Don't forget to hydrate from inside — drink 3+ litres of water daily</li>
</ul>

<h2>Shop Summer Essentials on MeraShop</h2>
<p>Find all your summer skincare essentials on MeraShop with great discounts on top brands like Mamaearth, Bombay Shaving Company, and more!</p>`,
        coverImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=400&fit=crop',
        category: 'Beauty Tips',
        tags: 'skincare,summer,beauty,indian-skin,tips',
        authorName: 'Dr. Anjali Mehta',
        isPublished: true,
        publishedAt: new Date('2025-02-01'),
        seoTitle: 'Summer Skincare Routine for Indian Skin - Expert Tips | MeraShop Blog',
        seoDescription: 'Expert summer skincare tips for Indian skin. Sunscreen, hydration, and product recommendations for the Indian summer.',
      },
      {
        title: 'Samsung Galaxy S24 Ultra vs iPhone 15 Pro Max: The Ultimate Comparison',
        slug: 'samsung-galaxy-s24-ultra-vs-iphone-15-pro-max',
        excerpt: 'The two biggest flagship smartphones go head-to-head. We compare every aspect from camera to performance to help you choose the right one.',
        content: `<h2>The Battle of Flagships</h2>
<p>Two titans of the smartphone world — Samsung Galaxy S24 Ultra and Apple iPhone 15 Pro Max — compete for your attention and wallet. Let's break down how they compare across every important metric.</p>

<h2>Design & Build</h2>
<p><strong>S24 Ultra:</strong> Titanium frame, Gorilla Glass Armor, 162.3 x 79 x 8.6mm, 232g. The flat display is a welcome change from the curved S23 Ultra.</p>
<p><strong>iPhone 15 Pro Max:</strong> Titanium frame, Ceramic Shield, 159.9 x 76.7 x 8.25mm, 221g. The lightest Pro Max ever with USB-C finally making an appearance.</p>

<h2>Display</h2>
<p><strong>S24 Ultra:</strong> 6.8" Dynamic AMOLED 2X, 3120x1440, 1-120Hz, 2600 nits peak brightness. Best display on any smartphone.</p>
<p><strong>iPhone 15 Pro Max:</strong> 6.7" Super Retina XDR OLED, 2796x1290, 1-120Hz, 2000 nits peak. Excellent but lower resolution.</p>

<h2>Camera</h2>
<p><strong>S24 Ultra:</strong> 200MP main + 12MP ultrawide + 50MP 5x telephoto + 10MP 3x telephoto. Galaxy AI photo editing is revolutionary.</p>
<p><strong>iPhone 15 Pro Max:</strong> 48MP main + 12MP ultrawide + 12MP 5x telephoto. Best-in-class video recording and natural processing.</p>

<h2>Performance</h2>
<p><strong>S24 Ultra:</strong> Snapdragon 8 Gen 3 — best Android performance ever</p>
<p><strong>iPhone 15 Pro Max:</strong> A17 Pro — still the benchmark for mobile processors</p>

<h2>Battery</h2>
<p><strong>S24 Ultra:</strong> 5000mAh, up to 30W wired, 15W wireless</p>
<p><strong>iPhone 15 Pro Max:</strong> 4441mAh, up to 27W wired, 15W MagSafe</p>

<h2>Verdict</h2>
<p>Both are exceptional phones. Choose the S24 Ultra for the S Pen, camera versatility, and Galaxy AI features. Choose the iPhone 15 Pro Max for video recording, ecosystem integration, and long-term software support. Both are available on MeraShop with great exchange offers!</p>`,
        coverImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=400&fit=crop',
        category: 'Product Comparison',
        tags: 'samsung,iphone,comparison,flagship,camera',
        authorName: 'Arjun Patel',
        isPublished: true,
        publishedAt: new Date('2025-01-25'),
        seoTitle: 'Samsung Galaxy S24 Ultra vs iPhone 15 Pro Max Comparison | MeraShop Blog',
        seoDescription: 'Detailed comparison of Samsung Galaxy S24 Ultra vs iPhone 15 Pro Max. Camera, performance, battery, and more.',
      },
      {
        title: 'Setting Up Your First Kitchen: Complete Checklist & Budget Guide',
        slug: 'first-kitchen-setup-checklist-budget-guide',
        excerpt: 'Moving into your first home? Here is the complete kitchen setup checklist with budget estimates for Indian homes.',
        content: `<h2>Your First Kitchen — Made Easy</h2>
<p>Setting up a kitchen from scratch can be overwhelming. Whether you're moving into your first apartment or setting up a new home, this comprehensive checklist covers everything you need.</p>

<h2>Essential Cookware</h2>
<ul>
<li>Pressure Cooker (5L) — Prestige Popular Plus</li>
<li>Non-stick Tawa (28cm) — Pigeon by Stovekraft</li>
<li>Kadai (2L) — For everyday cooking</li>
<li>Saucepan (1.5L) — For tea, milk, and gravies</li>
<li>Cooking Spoon Set — Stainless steel</li>
</ul>

<h2>Must-Have Appliances</h2>
<ul>
<li>Mixer Grinder — Bajaj Rex 500W</li>
<li>Induction Cooktop — For quick cooking</li>
<li>Electric Kettle — For tea and instant noodles</li>
<li>Toaster — For quick breakfasts</li>
</ul>

<h2>Budget Breakdown</h2>
<p>A basic kitchen setup in India can cost between ₹5,000-15,000 depending on your needs and the brands you choose. Here's a rough estimate:</p>
<ul>
<li>Basic cookware: ₹2,000-5,000</li>
<li>Essential appliances: ₹3,000-8,000</li>
<li>Storage & utensils: ₹1,000-3,000</li>
<li>Cutlery & serving: ₹500-2,000</li>
</ul>

<h2>Shop Kitchen Essentials on MeraShop</h2>
<p>Get everything you need for your kitchen at unbeatable prices on MeraShop. Combo deals and free delivery available!</p>`,
        coverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop',
        category: 'Home Guide',
        tags: 'kitchen,setup,guide,budget,first-home',
        authorName: 'Sneha Iyer',
        isPublished: true,
        publishedAt: new Date('2025-02-10'),
        seoTitle: 'First Kitchen Setup Checklist & Budget Guide | MeraShop Blog',
        seoDescription: 'Complete kitchen setup checklist with budget estimates for Indian homes. Essential cookware and appliances guide.',
      },
    ],
  })

  console.log('✅ Created 4 blog posts\n')

  // ============================================
  // STEP 10: Create Coupons
  // ============================================
  console.log('🎫 Creating coupons...')

  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: '10% off for new users on their first order',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 499,
        maxDiscount: 500,
        usageLimit: 1000,
        usedCount: 245,
        perUserLimit: 1,
        isActive: true,
        startsAt: new Date('2024-01-01'),
        expiresAt: new Date('2025-12-31'),
      },
      {
        code: 'SUMMER20',
        description: '20% off on summer sale items',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 999,
        maxDiscount: 1000,
        usageLimit: 500,
        usedCount: 89,
        perUserLimit: 2,
        isActive: true,
        startsAt: new Date('2025-03-01'),
        expiresAt: new Date('2025-06-30'),
      },
      {
        code: 'FLAT500',
        description: 'Flat ₹500 off on orders above ₹2000',
        discountType: 'fixed',
        discountValue: 500,
        minOrderValue: 2000,
        usageLimit: 2000,
        usedCount: 567,
        perUserLimit: 1,
        isActive: true,
        startsAt: new Date('2024-01-01'),
        expiresAt: new Date('2025-12-31'),
      },
      {
        code: 'DIWALI25',
        description: '25% off during Diwali festival sale',
        discountType: 'percentage',
        discountValue: 25,
        minOrderValue: 1499,
        maxDiscount: 2000,
        usageLimit: 3000,
        usedCount: 1234,
        perUserLimit: 1,
        isActive: false,
        startsAt: new Date('2024-10-15'),
        expiresAt: new Date('2024-11-15'),
      },
    ],
  })

  console.log('✅ Created 4 coupons\n')

  // ============================================
  // STEP 11: Create Newsletter Subscribers
  // ============================================
  console.log('📧 Creating newsletter subscribers...')

  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: 'priya.sharma@gmail.com', source: 'homepage', isActive: true },
      { email: 'rahul.verma@outlook.com', source: 'popup', isActive: true },
      { email: 'sneha.iyer@yahoo.com', source: 'footer', isActive: true },
      { email: 'amit.patel@gmail.com', source: 'homepage', isActive: true },
      { email: 'deepika.nair@gmail.com', source: 'popup', isActive: true },
    ],
  })

  console.log('✅ Created 5 newsletter subscribers\n')

  // ============================================
  // STEP 12: Create Contact Messages
  // ============================================
  console.log('💬 Creating sample contact messages...')

  await prisma.contactMessage.createMany({
    data: [
      {
        name: 'Amit Patel',
        email: 'amit.patel@gmail.com',
        phone: '+919876543211',
        subject: 'Order delivery issue',
        message: 'Hi, my order MS-2024-005 was supposed to be delivered yesterday but it shows as out for delivery. Can you please check?',
        isRead: true,
      },
      {
        name: 'Deepika Nair',
        email: 'deepika.nair@gmail.com',
        phone: '+919876543212',
        subject: 'Product return request',
        message: 'I received a damaged product. The screen of the tablet has a crack. I want to return it and get a replacement.',
        isRead: false,
      },
    ],
  })

  console.log('✅ Created 2 contact messages\n')

  // ============================================
  // FINAL: Summary
  // ============================================
  console.log('🎉 Seed completed successfully!\n')
  console.log('========== SEED SUMMARY ==========')

  const counts = {
    users: await prisma.user.count(),
    addresses: await prisma.address.count(),
    categories: await prisma.category.count(),
    brands: await prisma.brand.count(),
    products: await prisma.product.count(),
    productImages: await prisma.productImage.count(),
    productVariants: await prisma.productVariant.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    payments: await prisma.payment.count(),
    reviews: await prisma.review.count(),
    wishlistItems: await prisma.wishlistItem.count(),
    banners: await prisma.banner.count(),
    faqs: await prisma.fAQ.count(),
    blogPosts: await prisma.blogPost.count(),
    coupons: await prisma.coupon.count(),
    newsletterSubscribers: await prisma.newsletterSubscriber.count(),
    contactMessages: await prisma.contactMessage.count(),
  }

  for (const [key, value] of Object.entries(counts)) {
    console.log(`  ${key}: ${value}`)
  }

  console.log('==================================')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
