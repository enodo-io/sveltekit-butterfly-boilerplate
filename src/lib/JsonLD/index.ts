/**
 * JSON-LD Schema Generator
 *
 * Main module for generating JSON-LD structured data.
 * Combines multiple schema generators and exports the appropriate format
 * (single item or graph) based on the number of schema types requested.
 *
 * @module JsonLD
 */

import type { Graph, WithContext, Thing } from 'schema-dts';

import WebSite from './WebSite';
import WebPage from './WebPage';
import ProfilePage from './ProfilePage';
import Organization from './Organization';
import BreadcrumbList from './BreadcrumbList';
import Article from './Article';
import FAQPage from './FAQPage';

type JsonLdHandler = (data: App.PageData, types: string[]) => Graph | WithContext<Thing> | null;

const handlers: { [k: string]: (data: App.PageData) => Thing } = {
  WebSite,
  WebPage,
  ProfilePage,
  Organization,
  Article,
  FAQPage,
  BreadcrumbList,
};

/**
 * Generate JSON-LD structured data
 * @param {App.PageData} data - Page data
 * @param {string[]} types - Array of schema types to generate
 * @returns {Graph|WithContext<Thing>|null} - Generated structured data
 */
export const generateJsonLd: JsonLdHandler = (data, types = ['WebSite']) => {
  const schemes = types.map((type) => handlers[type](data));

  if (schemes.length <= 0) {
    return null;
  }

  if (types.length > 1) {
    const graph: Graph = {
      '@context': 'https://schema.org',
      '@graph': schemes,
    };
    return graph;
  }

  const thing: WithContext<Thing> = Object.assign(
    { '@context': 'https://schema.org' },
    schemes[0],
  ) as WithContext<Thing>;
  return thing;
};
