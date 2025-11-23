/**
 * Butterfly API Client
 *
 * Configured instance of the Butterfly client using environment variables.
 * This client is used throughout the application to interact with the Butterfly CMS API.
 *
 * @module api
 */

import { PUBLIC_API_URL, PUBLIC_API_KEY } from '$env/static/public';
import { Client } from '@enodo/butterfly-ts';

const client = new Client({
  domain: PUBLIC_API_URL,
  publicKey: PUBLIC_API_KEY,
});

export default client;
