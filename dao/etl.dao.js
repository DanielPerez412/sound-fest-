const db = require('../services/firebase.service');

const etlProcess = async (req, res) => {
    try {

        const { tracks, playlists } = req.body; 

        if (!tracks || !playlists) {
            return res.status(400).json({ error: "Faltan los datos de tracks o playlists en el body" });
        }

        console.log(`Iniciando ETL: ${tracks.length} canciones y ${playlists.length} playlists.`);

        for (const track of tracks) {

            await db.collection('tracks').doc(String(track.id)).set({
                title: track.title,
                artist_name: track.artist_name,
                genre: track.genre.toLowerCase(), 
                duration_seconds: Number(track.duration_seconds),
                cover: track.cover || null,
                audioSrc: track.audioSrc || '',
                updatedAt: new Date()
            });
        }

        for (const playlist of playlists) {
            await db.collection('playlists').doc(String(playlist.id)).set({
                name: playlist.name,
                owner: playlist.owner,
                trackIds: playlist.trackIds || [],
                cover: playlist.cover || null,
                createdAt: new Date()
            });
        }

        res.json({
            message: "ETL de Soundfest ejecutado correctamente. ¡Datos en Firebase!"
        });

    } catch (err) {
        console.error("Error en el ETL de Soundfest:", err);
        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = { etlProcess };