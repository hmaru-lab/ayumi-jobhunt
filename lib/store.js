const { list, put } = require('@vercel/blob');

const PREFIX = 'listings/data';

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

async function loadListings() {
  const token = blobToken();
  if (!token) {
    const e = new Error('BLOB_READ_WRITE_TOKEN is not configured');
    e.code = 'NO_BLOB';
    throw e;
  }
  const { blobs } = await list({ prefix: PREFIX, token, limit: 10 });
  const latest = blobs
    .filter(b => b.pathname === PREFIX + '.json')
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
  if (!latest) {
    const seed = require('../data/seed.json');
    const data = { listings: seed, updatedAt: new Date().toISOString() };
    await saveListings(data.listings);
    return data;
  }
  const res = await fetch(latest.url);
  if (!res.ok) throw new Error('failed to fetch blob: ' + res.status);
  return await res.json();
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
