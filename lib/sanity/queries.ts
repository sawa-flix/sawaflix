import { sanityClient } from "./client";

// ============================================================
// GROQ Queries for Area Tory
// ============================================================

// Fetch all stories with category and author dereferenced
export const STORIES_QUERY = `*[_type == "story"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  readTime,
  featured,
  likes,
  views,
  category->{
    _id,
    title,
    slug,
    color
  },
  author->{
    _id,
    name,
    avatar,
    role
  }
}`;

// Fetch stories by category
export const STORIES_BY_CATEGORY_QUERY = `*[_type == "story" && category->slug.current == $categorySlug] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  readTime,
  featured,
  likes,
  views,
  category->{
    _id,
    title,
    slug,
    color
  },
  author->{
    _id,
    name,
    avatar,
    role
  }
}`;

// Fetch a single story by slug with full body
export const STORY_BY_SLUG_QUERY = `*[_type == "story" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  readTime,
  featured,
  likes,
  views,
  body,
  category->{
    _id,
    title,
    slug,
    color
  },
  author->{
    _id,
    name,
    avatar,
    role,
    bio
  }
}`;

// Fetch a single story by _id (for backwards compat with numeric routes)
export const STORY_BY_ID_QUERY = `*[_type == "story" && _id == $id][0] {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  readTime,
  featured,
  likes,
  views,
  body,
  category->{
    _id,
    title,
    slug,
    color
  },
  author->{
    _id,
    name,
    avatar,
    role,
    bio
  }
}`;

// Fetch featured story for hero
export const FEATURED_STORY_QUERY = `*[_type == "story" && featured == true] | order(publishedAt desc)[0] {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  category->{
    title,
    color
  }
}`;

// Fetch all categories
export const CATEGORIES_QUERY = `*[_type == "category"] | order(title asc) {
  _id,
  title,
  slug,
  color
}`;

// Related stories (same category, exclude current)
export const RELATED_STORIES_QUERY = `*[_type == "story" && category._ref == $categoryId && _id != $currentId] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  mainImage,
  category->{
    title
  }
}`;

// ============================================================
// Data fetching functions
// ============================================================

export async function getStories() {
  return sanityClient.fetch(STORIES_QUERY);
}

export async function getStoriesByCategory(categorySlug: string) {
  return sanityClient.fetch(STORIES_BY_CATEGORY_QUERY, { categorySlug });
}

export async function getStoryBySlug(slug: string) {
  return sanityClient.fetch(STORY_BY_SLUG_QUERY, { slug });
}

export async function getStoryById(id: string) {
  return sanityClient.fetch(STORY_BY_ID_QUERY, { id });
}

export async function getFeaturedStory() {
  return sanityClient.fetch(FEATURED_STORY_QUERY);
}

export async function getCategories() {
  return sanityClient.fetch(CATEGORIES_QUERY);
}

export async function getRelatedStories(categoryId: string, currentId: string) {
  return sanityClient.fetch(RELATED_STORIES_QUERY, { categoryId, currentId });
}
