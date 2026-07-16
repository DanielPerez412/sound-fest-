const express = require("express");
const router = express.Router();

const activityDao = require("../dao/Activity.dao");
const musicDao = require("../dao/music.dao");
const userDao = require("../dao/user.dao");
const subscriptionDao = require("../dao/subscription.dao");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [summary, topSongs] = await Promise.all([
      activityDao.getMonthlyStatsForUser(req.user.id),
      activityDao.getTopSongsForUser(req.user.id),
    ]);
    res.json({ ...summary, topSongs });
  } catch (error) {
    next(error);
  }
});

router.get("/top-songs", async (_req, res, next) => {
  try {
    res.json(await activityDao.getTopSongsGlobal());
  } catch (error) {
    next(error);
  }
});

router.get("/admin", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const [users, songs, artists, premiumUsers, freeUsers] = await Promise.all([
      userDao.countAll(),
      musicDao.countAll(),
      musicDao.countArtists(),
      subscriptionDao.countActivePremium(),
      subscriptionDao.countActiveFree(),
    ]);
    res.json({ users, songs, artists, premiumUsers, freeUsers });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
