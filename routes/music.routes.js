const express = require("express");
const router = express.Router();

const musicDao = require("../dao/music.dao");
const activityDao = require("../dao/Activity.dao");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

router.get("/", async (req, res, next) => {
  try {
    const songs = await musicDao.getAll({ search: req.query.q, genre: req.query.genre });
    res.json(songs);
  } catch (err) {
    next(err);
  }
});

router.get("/genres", async (req, res, next) => {
  try {
    res.json(await musicDao.getGenres());
  } catch (err) {
    next(err);
  }
});

router.get("/artists", async (req, res, next) => {
  try {
    res.json(await musicDao.getAllArtists());
  } catch (err) {
    next(err);
  }
});

router.get("/artists/:id", async (req, res, next) => {
  try {
    const artist = await musicDao.getArtistById(req.params.id);
    if (!artist) return res.status(404).json({ error: "Artista no encontrado" });
    res.json(artist);
  } catch (err) {
    next(err);
  }
});

router.post("/artists", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, biography, imageUrl } = req.body;
    if (!name) return res.status(400).json({ error: "name es obligatorio" });
    res.status(201).json(await musicDao.createArtist({ name, biography, imageUrl }));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const song = await musicDao.getById(req.params.id);
    if (!song) return res.status(404).json({ error: "Cancion no encontrada" });
    res.json(song);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { title, artistId, genre, durationSeconds, audioUrl, coverImage } = req.body;
    if (!title) return res.status(400).json({ error: "title es obligatorio" });
    res.status(201).json(
      await musicDao.create({ title, artistId, genre, durationSeconds, audioUrl, coverImage })
    );
  } catch (err) {
    next(err);
  }
});

router.post("/:id/play", requireAuth, async (req, res, next) => {
  try {
    const played = await activityDao.logPlay(req.user.id, req.params.id);
    if (!played) return res.status(404).json({ error: "Cancion no encontrada" });
    res.json({ message: "Reproduccion registrada" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
