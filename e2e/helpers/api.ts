import { Client } from '@enodo/butterfly-ts';
import type * as Butterfly from '@enodo/butterfly-ts';

const API_URL = process.env.PUBLIC_API_URL;
const API_KEY = process.env.PUBLIC_API_KEY;

if (!API_URL || !API_KEY) {
  throw new Error('PUBLIC_API_URL and PUBLIC_API_KEY must be defined in .env');
}

const client = new Client({
  domain: API_URL,
  publicKey: API_KEY,
});

interface PageTestData {
  categoryPath?: string;
  authorId?: string;
  postSlug?: string;
  postId?: number;
  pageSlug?: string;
  feedFormat?: 'rss' | 'atom';
}

export async function getRandomCategory(): Promise<string | null> {
  try {
    const response = await client.get<Butterfly.Category[]>({
      endpoint: 'categories',
      query: { page: { size: 100 } },
    });

    if (
      !response ||
      !response.data ||
      !Array.isArray(response.data) ||
      response.data.length === 0
    ) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * response.data.length);
    return response.data[randomIndex].attributes?.path ?? null;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return null;
  }
}

export async function getRandomAuthor(): Promise<string | null> {
  try {
    const response = await client.get<Butterfly.Author[]>({
      endpoint: 'authors',
      query: { page: { size: 100 } },
    });

    if (
      !response ||
      !response.data ||
      !Array.isArray(response.data) ||
      response.data.length === 0
    ) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * response.data.length);
    return response.data[randomIndex].id ?? null;
  } catch (error) {
    console.error('Error fetching authors:', error);
    return null;
  }
}

export async function getRandomPost(): Promise<{ slug: string; id: number } | null> {
  try {
    const response = await client.get<Butterfly.Post[]>({
      endpoint: 'posts',
      query: { page: { size: 100 } },
    });

    if (
      !response ||
      !response.data ||
      !Array.isArray(response.data) ||
      response.data.length === 0
    ) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * response.data.length);
    const post = response.data[randomIndex];
    return {
      slug: post.attributes?.slug ?? '',
      id: post.id ?? 0,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return null;
  }
}

export function getRandomStaticPage(): string | null {
  const staticPages = process.env.PUBLIC_STATIC_PAGES;

  if (!staticPages) {
    return null;
  }

  try {
    const pages = JSON.parse(staticPages);
    const keys = Object.keys(pages);

    if (keys.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  } catch (error) {
    console.error('Error parsing PUBLIC_STATIC_PAGES:', error);
    return null;
  }
}

export function getRandomFeedFormat(): 'rss' | 'atom' {
  return Math.random() > 0.5 ? 'rss' : 'atom';
}

export async function generateTestUrl(): Promise<{
  url: string;
  type: string;
  data: PageTestData;
} | null> {
  // Randomly choose which type of page to test
  const pageType = Math.floor(Math.random() * 10);

  const data: PageTestData = {};

  switch (pageType) {
    case 0:
      return { url: '/', type: 'home', data };

    case 1:
      return { url: '/articles', type: 'articles', data };

    case 2:
      return { url: '/authors', type: 'authors', data };

    case 3:
      return { url: '/search', type: 'search', data };

    case 4:
      return { url: '/tags', type: 'tags', data };

    case 5: {
      const categoryPath = await getRandomCategory();
      if (!categoryPath) return null;
      return { url: categoryPath, type: 'category', data: { categoryPath } };
    }

    case 6: {
      const authorId = await getRandomAuthor();
      if (!authorId) return null;
      return { url: `/authors/${authorId}`, type: 'author', data: { authorId } };
    }

    case 7: {
      const post = await getRandomPost();
      if (!post || !post.slug || !post.id) return null;
      return {
        url: `/${post.slug}-${post.id}.html`,
        type: 'post',
        data: { postSlug: post.slug, postId: post.id },
      };
    }

    case 8: {
      const pageSlug = getRandomStaticPage();
      if (!pageSlug) return null;
      return { url: `/${pageSlug}.html`, type: 'page', data: { pageSlug } };
    }

    case 9: {
      const format = getRandomFeedFormat();
      return { url: `/${format}.html`, type: 'feed', data: { feedFormat: format } };
    }
  }

  return null;
}
