const jwt = require("jsonwebtoken");

function getSecret() {

  return process.env.JWT_SECRET || "ClaveSecretaSuperSeguraDeSoundFest123!";
}

function signToken(payload) {
  return jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

module.exports = { signToken, verifyToken };