import express from 'express';
import axios from 'axios';

const app = express();

const clientID = "Insira suas credenciais"
const clientSecret = "Insira suas credenciais"

//  Variavel de token a ser recebida
let acessToken = ""
// Variavel de quando o token será inválido
let tokenExpiresAt = 0


// Funções de requisição para criação do uso do Token
const getAcessToken = async()=> {
    const url = "https://accounts.spotify.com/api/token"
    const data = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientID,
        client_secret: clientSecret
    })

    try {
        const response = await axios.post(url, data.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        acessToken = response.data.access_token
        const expiresIn = response.data.expires_in
        // A variavel agora recebe um horário específico de quando vai ser expirado o token
        tokenExpiresAt = Date.now() + (expiresIn * 1000) // O tempo que foi recebido em segundos será convertido para ms
        console.log(expiresIn)
    }catch(err) {
        console.error('Ocorreu um erro: ', err)
    }
}

const verifyValidToken = async() => {
    if(Date.now() > tokenExpiresAt){
        console.log("Token expirado. Buscando novo token")
        await getAcessToken()
    }
}

//Funções de busca:

//Procura pela música
const searchTrack = async(musicName) => {
    const url = `https://api.spotify.com/v1/search?query=${musicName}&type=track&locale=pt-BR%2Cpt%3Bq%3D0.9&offset=0&limit=20`
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${acessToken}`
            }
        })
        const listItems = response.data.tracks.items
        return listItems        
    }catch(err) {
        console.error('Ocorreu um erro: ', err)
    }

}
//Procura pelo artista
const searchArtist = async(artistName) => {
    const url = `https://api.spotify.com/v1/search?query=${artistName}&type=artist&locale=pt-BR%2Cpt%3Bq%3D0.9&offset=0&limit=20`
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${acessToken}`
            }
        })
        const listItems = response.data.artists.items
        return listItems
    }catch(err) {
        console.error('Ocorreu um erro: ', err)
    }
}
//Procura pelo álbum
const searchAlbum = async(albumName) => {
    const url = `https://api.spotify.com/v1/search?query=${albumName}&type=album&locale=pt-BR%2Cpt%3Bq%3D0.9&offset=0&limit=20`
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${acessToken}`
            }
        })
        const listItems = response.data.albums.items
        return listItems
    }catch(err) {
        console.error('Ocorreu um erro: ', err)
    }
}
//Entra nos detalhes do artista
const detailsArtist = async(idArtist) => {
    const url = `https://api.spotify.com/v1/artists/${idArtist}`
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${acessToken}`
            }
        })
        return response.data
    }catch(e){
        console.error('Erro: ', e)
    }
}
//Entra nos detalhes da música
const musicDetails = async(idMusic) => {
    const url = `https://api.spotify.com/v1/tracks/${idMusic}`
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${acessToken}`
            }
        })
        return response.data
    }catch(e){
        console.error('Erro: ', e)
    }

}

//Detalhes do álbum
const albumDetails = async(idAlbum) => {
    const url = `https://api.spotify.com/v1/albums/${idAlbum}`
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${acessToken}`
            }
        })
        return response.data
    }catch(e){
        console.error(e)
    }
}

getAcessToken().then(() => {
    app.get('/token', (req, res) => {
        res.json({ acessToken })
    })
    app.get('/searchMusic/:musicName', async (req, res)=> {
        const musicName = req.params.musicName
        try {
            await verifyValidToken();
            const musicData = await searchTrack(musicName)
            const formatted = musicData.map(item => ({
                id: item.id,
                song: item.name,
                album_type: item.album.album_type,
                album_name: item.album.name,
                artist_name: item.artists[0].name,
                image_url: item.album.images[0].url,
                album_id: item.album.id
            }))
            res.status(200).json(formatted)
        }catch(e) {
            res.status(500).json({"erro": e})
        }
    })

    app.get('/musicDetails/:idMusic', async (req, res)=> {
        const idMusic = req.params.idMusic
        try {
            await verifyValidToken();
            const musicData = await musicDetails(idMusic)
            const formatted = {
                id: musicData.id,
                name: musicData.name,
                releaseDate: musicData.album.release_date,
                artistId: musicData.artists[0].id,
                artist: musicData.artists[0].name,
                albumId: musicData.album.id,
                albumType: musicData.album.album_type,
                albumName: musicData.album.name,
                orderTrack: musicData.track_number,
                albumImage: musicData.album.images[0].url,
                externalLink: musicData.external_urls.spotify
            }
            res.status(200).json(formatted)
        }catch(e){
            console.log(e)
            res.status(500).json({"erro": e})
        }
    })
    app.get('/searchAlbum/:albumName', async (req, res)=> {
        const albumName = req.params.albumName
        try {
            await verifyValidToken();
            const albumData = await searchAlbum(albumName)
            const formatted = albumData.map(item => ({
                id: item.id,
                album_name: item.name,
                album_type: item.type,
                artist_name: item.artists[0].name,
                image_url: item.images[0].url,
                release_date: item.release_date
            }))
            res.status(200).json(formatted)
        }catch(e) {
            res.status(500).json({"erro": e})
        }
    })
    app.get('/albumDetails/:idAlbum', async (req, res)=> {
        const idAlbum = req.params.idAlbum
        try {
            await verifyValidToken();
            const albumData = await albumDetails(idAlbum)
            const formatted = {
                id: albumData.id,
                albumType: albumData.album_type,
                albumName: albumData.name,
                releaseDate: albumData.releaseDate,
                externalLink: albumData.external_urls.spotify,
                albumImage: albumData.images[0].url,
                artistId: albumData.artists[0].id,
                artistName: albumData.artists[0].name,
                tracks: albumData.tracks.items.map(track => ({
                    id: track.id,
                    name: track.name,
                    orderTrack: track.track_number
                }))
            }
            res.status(200).json(formatted)
        }catch(e){
            console.log(e)
            res.status(500).json({"erro": e})
        }
    })


    app.get('/searchArtist/:artistName', async(req, res)=> {
        const artistName = req.params.artistName
        try {
            await verifyValidToken();
            const artistData = await searchArtist(artistName)
            const formatted = await Promise.all(artistData.map(async (artist) => {
                const details = await detailsArtist(artist.id)
                return {
                    id: artist.id,
                    artist: artist.name,
                    image: details.images[0]?.url
                }
            }))
            res.status(200).json(formatted)
        }catch(e){
            console.log(e)
            res.status(500).json({"erro": e})
        }
    })
    app.get('/artistDetails/:id', async(req, res)=> {
        const idArtist = req.params.id
        try {
            await verifyValidToken();
            const artistData = await detailsArtist(idArtist)
            res.status(200).json(artistData)
        }catch(e){
            console.log(e)
            res.status(500).json({"erro": e})
        }
    })
})

export default app;
