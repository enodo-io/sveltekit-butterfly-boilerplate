/**
 * BreadcrumbList JSON-LD Schema Generator
 *
 * Generates breadcrumb navigation data for a page.
 * Automatically builds the breadcrumb trail based on category hierarchy,
 * tags, pagination, and other page metadata.
 *
 * @module BreadcrumbList
 * @param {App.PageData} data - Page data containing categories, scope, and layer
 * @returns {BreadcrumbList} - Structured breadcrumb data
 */

import type { BreadcrumbList, ListItem } from 'schema-dts';
import type * as Butterfly from '@enodo/butterfly-ts';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { getRelated } from '@enodo/butterfly-ts';

function pushItem(list: ListItem[], name: string, item?: string) {
  list.push({
    '@type': 'ListItem',
    position: list.length + 1,
    name,
    item,
  });
}

function generateCategoriesTree(
  category: Butterfly.Category,
  categories: Butterfly.Category[],
  tree: Butterfly.Category[] = [],
) {
  const $tree = tree;
  $tree.push(category);

  if (category.relationships.parentCategory.data?.id) {
    const parent = categories.find(
      (c) => c.id === category.relationships.parentCategory.data?.id,
    ) as Butterfly.Category;
    return generateCategoriesTree(parent, categories, tree);
  }
  return tree.reverse();
}

export default function getBreadcrumbList(data: App.PageData): BreadcrumbList {
  const itemListElement: ListItem[] & { pushItem?: (name: string, item?: string) => void } = [];

  if (data.layer['content.type'] !== 'home') {
    pushItem(itemListElement, data.settings.title, PUBLIC_BASE_URL);
  }

  const catId =
    data.scope?.data.relationships.category?.data?.id ||
    data.scope?.data.relationships.parentCategory?.data?.id;
  if (catId && data.layer['content.type'] !== 'tag') {
    const category = data.categories.data.find(
      (c: Butterfly.Category) => c.id === catId,
    ) as Butterfly.Category;
    const tree = generateCategoriesTree(category, data.categories.data);
    tree.forEach((c) =>
      pushItem(itemListElement, c.attributes.name, `${PUBLIC_BASE_URL}${c.attributes.path}`),
    );
  }

  const tags = data.scope?.data.relationships.terms?.data.filter((t: Butterfly.Term) =>
    t.type.includes('tags'),
  );
  if (tags?.length) {
    const tag = getRelated(tags[0], data.scope?.included as Butterfly.Resource[]) as Butterfly.Term;
    pushItem(itemListElement, tag.attributes.name, `${PUBLIC_BASE_URL}/tags/${tag.id}`);
  }

  if (data.layer['content.type'] === 'author') {
    pushItem(itemListElement, 'Authors', `${PUBLIC_BASE_URL}/authors`);
  }

  if (data.layer['content.type'] === 'tag') {
    pushItem(itemListElement, 'Tags', `${PUBLIC_BASE_URL}/tags`);
  }

  const query = data.layer['page.query'];
  if (query?.length) {
    pushItem(itemListElement, 'Search', `${PUBLIC_BASE_URL}/search`);
  }

  const page = data.layer['page.index'] || 1;
  if (page > 1) {
    const title = data.meta.title.replace(/ - Page (\d+)/, '');
    const url = data.meta.url.replace(/(\?|&)page=(\d+)/, '');

    pushItem(itemListElement, title, url);
  }

  pushItem(itemListElement, page > 1 ? `Page ${page}` : data.meta.title);

  return {
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}
