import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const query = getQuery(event);
  const slug = query.slug as string;

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required',
    });
  }

  const { wpApiUrl, wpApiUser, wpApiPass } = config;

  if (!wpApiUrl || !wpApiUser || !wpApiPass) {
    throw createError({
      statusCode: 500,
      statusMessage: 'WordPress API configuration is missing in runtimeConfig',
    });
  }

  // Basic Auth Header
  const auth = Buffer.from(`${wpApiUser}:${wpApiPass}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
  };

  try {
    // 1. Try to find a POST with this slug
    let response: any = await $fetch(`${wpApiUrl}/wp-json/wp/v2/posts`, {
      params: { slug, _embed: '1' },
      headers,
    });

    // 2. If not found, try to find a PAGE with this slug
    if (!response || response.length === 0) {
      response = await $fetch(`${wpApiUrl}/wp-json/wp/v2/pages`, {
        params: { slug, _embed: '1' },
        headers,
      });
    }

    if (!response || response.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Content not found',
      });
    }

    const data = response[0];

    // Extract Featured Image (if exists)
    const featuredMedia = data._embedded?.['wp:featuredmedia']?.[0];
    const featuredImage = featuredMedia ? {
      url: featuredMedia.source_url,
      alt: featuredMedia.alt_text || data.title.rendered,
      width: featuredMedia.media_details?.width,
      height: featuredMedia.media_details?.height,
    } : null;

    // Extract Taxonomies (Categories and Tags)
    const categories = data._embedded?.['wp:term']?.[0]?.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    })) || [];

    const tags = data._embedded?.['wp:term']?.[1]?.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })) || [];

    // Clean and return object
    return {
      id: data.id,
      type: data.type,
      slug: data.slug,
      title: data.title.rendered,
      content: data.content.rendered,
      excerpt: data.excerpt.rendered,
      date: data.date,
      modified: data.modified,
      featuredImage,
      categories,
      tags,
      author: data._embedded?.author?.[0]?.name || 'Admin',
      // Technical SEO data
      seo: {
        title: data.yoast_head_json?.title || data.title.rendered,
        description: data.yoast_head_json?.description || data.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 160),
        ogImage: data.yoast_head_json?.og_image?.[0]?.url || featuredImage?.url,
      }
    };

  } catch (error: any) {
    console.error('[WP-API-ERROR]', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Error fetching WordPress content',
    });
  }
});
