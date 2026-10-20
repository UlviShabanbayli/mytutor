import { createApp } from './app';

/**
 * The Cloudflare Worker entry (wrangler.toml): the demo world only. It must never import the
 * content folder's code or Node APIs, so no book content can reach the deployed bundle.
 */
export default createApp();
