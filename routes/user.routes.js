const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const userDao = require("../dao/user.dao");
const { signToken } = require("../utils/jwt.util");
const { requireAuth } = require("../middlewares/auth.middleware");

router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email y password son obligatorios" });
    }
    if (await userDao.getByEmail(email)) {
      return res.status(409).json({ error: "Ese email ya esta registrado" });
    }
    if (await userDao.getByUsername(username)) {
      return res.status(409).json({ error: "Ese username ya esta en uso" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userDao.create({ username, email, passwordHash, firstName, lastName });
    const token = signToken({ id: user.user_id, username: user.username, role: user.role || "user" });
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email y password son obligatorios" });
    }

    const user = await userDao.getByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    const token = signToken({ id: user.user_id, username: user.username, role: user.role || "user" });
    res.json({
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role || "user",
      },
      token,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await userDao.getById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put("/me", requireAuth, async (req, res, next) => {
  try {
    const { username, email, firstName, lastName, profilePicture } = req.body;
    const user = await userDao.updateProfile(req.user.id, {
      username,
      email,
      firstName,
      lastName,
      profilePicture,
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
