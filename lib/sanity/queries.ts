/* eslint-disable @typescript-eslint/no-explicit-any */
import { sanityFetch } from "./client";

// ============================================================
// GROQ Queries for Area Tory
// ============================================================

const STORIES_QUERY = `*[_type == "story"] | order(publishedAt desc) {
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

const FEATURED_STORY_QUERY = `*[_type == "story" && featured == true] | order(publishedAt desc)[0] {
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

const CATEGORIES_QUERY = `*[_type == "category"] | order(title asc) {
  _id,
  title,
  slug,
  color
}`;

const BLOG_SETTINGS_QUERY = `*[_type == "blogSettings"][0] {
  heroTitle,
  heroSubtitle,
  heroBackgroundImage
}`;

// ============================================================
// Data fetching functions
// ============================================================

export async function getStories() {
  return sanityFetch(STORIES_QUERY);
}

export async function getStoriesByCategory(categorySlug: string) {
  const query = `*[_type == "story" && category->slug.current == $categorySlug] | order(publishedAt desc) {
    _id, title, slug, excerpt, mainImage, publishedAt, readTime, featured, likes, views,
    category->{ _id, title, slug, color },
    author->{ _id, name, avatar, role }
  }`;
  return sanityFetch(query, { categorySlug });
}

export async function getStoryBySlug(slug: string) {
  const query = `*[_type == "story" && slug.current == $slug][0] {
    _id, title, slug, excerpt, mainImage, publishedAt, readTime,
    featured, likes, views, body,
    category->{ _id, title, slug, color },
    author->{ _id, name, avatar, role, bio }
  }`;
  return sanityFetch(query, { slug });
}

export async function getStoryById(id: string) {
  const query = `*[_type == "story" && _id == $id][0] {
    _id, title, slug, excerpt, mainImage, publishedAt, readTime,
    featured, likes, views, body,
    category->{ _id, title, slug, color },
    author->{ _id, name, avatar, role, bio }
  }`;
  return sanityFetch(query, { id });
}

export async function getFeaturedStory() {
  return sanityFetch(FEATURED_STORY_QUERY);
}

export async function getCategories() {
  return sanityFetch(CATEGORIES_QUERY);
}

export async function getRelatedStories(categoryId: string, currentId: string) {
  const query = `*[_type == "story" && category._ref == $categoryId && _id != $currentId] | order(publishedAt desc)[0...3] {
    _id, title, slug, mainImage,
    category->{ title }
  }`;
  return sanityFetch(query, { categoryId, currentId });
}

export async function getStoryCount() {
  return sanityFetch(`count(*[_type == "story"])`);
}

export async function getTotalViews() {
  return sanityFetch(`math::sum(*[_type == "story"].views)`);
}

export async function getBlogSettings() {
  return sanityFetch(BLOG_SETTINGS_QUERY);
}
