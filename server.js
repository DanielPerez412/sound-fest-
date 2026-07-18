const express = require("express");
const cors = require("cors");

const musicRoutes = require("./routes/music.routes");
const playlistRoutes = require("./routes/playlist.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const userRoutes = require("./routes/user.routes");
const statsRoutes = require("./routes/Stats.routes");

const api = express();
const port = Number(process.env.PORT || 5000);

api.use(cors());
api.use(express.json());
api.use(express.static("public"));
const path = require("path");
api.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "grafica.html"));
});

api.get("/health", (_req, res) => res.json({ status: "ok" }));

api.use("/music", musicRoutes);
api.use("/playlists", playlistRoutes);
api.use("/subscriptions", subscriptionRoutes);
api.use("/users", userRoutes);
api.use("/stats", statsRoutes);

api.use((req, res) => res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` }));
api.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: "Error interno del servidor" });
});

if (require.main === module) {
  api.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

module.exports = api;


//