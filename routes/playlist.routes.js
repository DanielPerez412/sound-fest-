const express = require("express");
const router = express.Router();

const playlistDao = require("../dao/playlist.dao");
const { requireAuth } = require("../middlewares/auth.middleware");

async function ensureOwner(req, res, next) {
  try {
    const playlist = await playlistDao.getById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist no encontrada" });
    if (Number(playlist.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ error: "No eres el propietario de esta playlist" });
    }
    req.playlist = playlist;
    next();
  } catch (err) {
    next(err);
  }
}

router.get("/", async (req, res, next) => {
  try {
    res.json(await playlistDao.getPublic());
  } catch (err) {
    next(err);
  }
});

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    res.json(await playlistDao.getByUserId(req.user.id));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const playlist = await playlistDao.getById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist no encontrada" });
    const songs = await playlistDao.getSongs(playlist.id);
    res.json({ ...playlist, songs });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;
    if (!name) return res.status(400).json({ error: "name es obligatorio" });
    res.status(201).json(
      await playlistDao.create({ userId: req.user.id, name, description, isPublic })
    );
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, ensureOwner, async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;
    await playlistDao.update(req.params.id, { name, description, isPublic });
    res.json(await playlistDao.getById(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, ensureOwner, async (req, res, next) => {
  try {
    await playlistDao.delete(req.params.id);
    res.json({ message: "Playlist eliminada correctamente" });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/songs", requireAuth, ensureOwner, async (req, res, next) => {
  try {
    const { songId } = req.body;
    if (!songId) return res.status(400).json({ error: "songId es obligatorio" });
    await playlistDao.addSong(req.params.id, songId);
    res.status(201).json(await playlistDao.getSongs(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/songs/:songId", requireAuth, ensureOwner, async (req, res, next) => {
  try {
    await playlistDao.removeSong(req.params.id, req.params.songId);
    res.json(await playlistDao.getSongs(req.params.id));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
