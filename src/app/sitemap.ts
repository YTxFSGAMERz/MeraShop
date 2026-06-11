import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://merashop.in'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Dynamic product pages
  try {
    const products = await db.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Dynamic category pages
    const categories = await db.category.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/shop?category=${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Dynamic blog pages
    const blogPosts = await db.blogPost.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...productPages, ...categoryPages, ...blogPages]
  } catch (error) {
    console.error('[Sitemap] Error fetching dynamic pages:', error)
    return staticPages
  }
}
