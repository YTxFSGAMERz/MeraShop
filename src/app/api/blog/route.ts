import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const category = searchParams.get('category')
    const slug = searchParams.get('slug')

    // If slug is provided, return a single post
    if (slug) {
      const post = await db.blogPost.findUnique({
        where: { slug, isPublished: true },
      })

      if (!post) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        )
      }

      // Parse tags
      const tags = post.tags
        ? post.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []

      return NextResponse.json({
        post: { ...post, tags },
      })
    }

    // Build where clause for listing
    const where: Prisma.BlogPostWhereInput = {
      isPublished: true,
    }

    if (category) {
      where.category = category
    }

    const total = await db.blogPost.count({ where })
    const totalPages = Math.ceil(total / limit)

    const posts = await db.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        authorName: true,
        publishedAt: true,
        createdAt: true,
      },
    })

    // Parse tags for each post
    const transformedPosts = posts.map((post) => ({
      ...post,
      tags: post.tags ? post.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    }))

    return NextResponse.json({
      posts: transformedPosts,
      total,
      page,
      totalPages,
    })
  } catch (error) {
    console.error('[API /blog] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}
