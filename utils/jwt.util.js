const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

function getSecret() {
  if (!secret) {
    throw new Error("JWT_SECRET must be configured before issuing or validating tokens");
  }
  return secret;
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
