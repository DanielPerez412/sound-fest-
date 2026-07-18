const { verifyToken } = require("../utils/jwt.util");

function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Se requiere un token Bearer" });
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Token invalido o expirado" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ error: "Se requieren permisos de administrador" });
}

module.exports = { requireAuth, requireAdmin };

//