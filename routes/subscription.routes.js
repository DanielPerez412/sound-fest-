const express = require("express");
const router = express.Router();

const subscriptionDao = require("../dao/subscription.dao");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

router.get("/plans", async (req, res, next) => {
  try {
    res.json(await subscriptionDao.getPlans());
  } catch (err) {
    next(err);
  }
});

router.post("/plans", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, price, durationDays, description } = req.body;
    if (!name || price === undefined || !durationDays) {
      return res.status(400).json({ error: "name, price y durationDays son obligatorios" });
    }
    res.status(201).json(await subscriptionDao.createPlan({ name, price, durationDays, description }));
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const sub = await subscriptionDao.getActiveByUserId(req.user.id);
    res.json(sub || { status: "none" });
  } catch (err) {
    next(err);
  }
});

router.post("/subscribe", requireAuth, async (req, res, next) => {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ error: "planId es obligatorio" });

    const plan = await subscriptionDao.getPlanById(planId);
    if (!plan) return res.status(404).json({ error: "Plan no encontrado" });

    await subscriptionDao.expireActive(req.user.id);

    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration_days);
    const toISODate = (d) => d.toISOString().slice(0, 10);

    const subscription = await subscriptionDao.create({
      userId: req.user.id,
      planId: plan.plan_id,
      startDate: toISODate(start),
      endDate: toISODate(end),
    });

    res.status(201).json(subscription);
  } catch (err) {
    next(err);
  }
});

router.post("/cancel", requireAuth, async (req, res, next) => {
  try {
    const { subscriptionId } = req.body;
    if (!subscriptionId) return res.status(400).json({ error: "subscriptionId es obligatorio" });
    const cancelled = await subscriptionDao.cancel(subscriptionId, req.user.id);
    if (!cancelled) return res.status(404).json({ error: "Suscripcion no encontrada" });
    res.json({ message: "Suscripcion cancelada correctamente" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;