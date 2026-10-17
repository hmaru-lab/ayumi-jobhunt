const { list, put } = require('@vercel/blob');

const PREFIX = 'listings/data';

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

// Deterministic public URL derived from the token's store ID.
// Avoids list() eventual-consistency issues.
function blobUrl() {
  const t = blobToken();
  const m = t && t.match(/^vercel_blob_rw_([A-Za-z0-9]+)_/);
  if (!m) return null;
  return `https://${m[1]}.public.blob.vercel-storage.com/${PREFIX}.json`;
}

async function fetchViaList(token) {
  const { blobs } = await list({ prefix: PREFIX, token, limit: 20 });
  const candidates = blobs
    .filter(b => b.pathname === PREFIX + '.json')
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  for (const b of candidates) {
    const res = await fetch(b.url, { cache: 'no-store' });
    if (res.ok) return await res.json();
  }
  return null;
}

async function loadListings() {
  const token = blobToken();
  if (!token) {
    const e = new Error('BLOB_READ_WRITE_TOKEN is not configured');
    e.code = 'NO_BLOB';
    throw e;
  }
  // 1) Try deterministic URL first (fast, consistent)
  const url = blobUrl();
  if (url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) return await res.json();
    if (res.status !== 404) {
      // Fall through to list() on unexpected errors
      console.error('deterministic fetch failed:', res.status);
    }
  }
  // 2) Fall back to list()
  const viaList = await fetchViaList(token);
  if (viaList) return viaList;
  // 3) Seed from bundled data
  const seed = require('../data/seed.json');
  const data = { listings: seed, updatedAt: new Date().toISOString() };
  await saveListings(data.listings);
  return data;
}

async function saveListings(listings) {
  const token = blobToken();
  if (!token) {
    const e = new Error('BLOB_READ_WRITE_TOKEN is not configured');
    e.code = 'NO_BLOB';
    throw e;
  }
  const data = { listings, updatedAt: new Date().toISOString() };
  await put(PREFIX + '.json', JSON.stringify(data), {
    access: 'public',
    token,
    addRandomSuffix: false,
    contentType: 'application/json',
  });
  return data;
}

module.exports = { loadListings, saveListings };
