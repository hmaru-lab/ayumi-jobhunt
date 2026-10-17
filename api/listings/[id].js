const { isAuthed } = require('../../lib/auth');
const { loadListings, saveListings } = require('../../lib/store');

const EDITABLE = ['status', 'starred', 'caution', 'memo', 'category', 'curated'];

module.exports = async (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorized' });
  const { id } = req.query;

  if (req.method === 'PATCH') {
    const b = req.body || {};
    try {
      const data = await loadListings();
      const item = data.listings.find(l => l.id === id);
      if (!item) return res.status(404).json({ error: 'not found' });
      for (const k of EDITABLE) {
        if (b[k] !== undefined) item[k] = b[k];
      }
      const saved = await saveListings(data.listings);
      return res.status(200).json({ ok: true, item, updatedAt: saved.updatedAt });
    } catch (e) {
      if (e.code === 'NO_BLOB') return res.status(503).json({ error: 'storage not configured' });
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const data = await loadListings();
      const idx = data.listings.findIndex(l => l.id === id);
      if (idx === -1) return res.status(404).json({ error: 'not found' });
      data.listings.splice(idx, 1);
      const saved = await saveListings(data.listings);
      return res.status(200).json({ ok: true, updatedAt: saved.updatedAt });
    } catch (e) {
      if (e.code === 'NO_BLOB') return res.status(503).json({ error: 'storage not configured' });
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'method not allowed' });
};
