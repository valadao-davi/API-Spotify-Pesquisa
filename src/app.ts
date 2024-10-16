import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv'

dotenv.config({path: './src/.env'})
const app = express();

const { clientID } = process.env
const { clientSecret } = process.env


//  Variavel de token a ser recebida
let acessToken: string | null = null;
// Variavel de quando o token será inválido
let tokenExpiresAt: number = 0;


// Funções de requisição para criação do uso do Token
const getAcessToken = async(): Promise<void> => {

    if(!clientID || !clientSecret) {
        throw new Error("Client ID ou Client Secret não definidos no .env")
    }

    const url: string = "https://accounts.spotify.com/api/token"
    
    const data: URLSearchParams = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientID,
        client_secret: clientSecret
    })

    try {
        const response = await axios.post<{ access_token: string, expires_in: number }>(url, data.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' 
            }
        })
        acessToken = response.data.access_token
        const expiresIn: number = response.data.expires_in
        // A variavel agora recebe um horário específico de quando vai ser expirado o token
        tokenExpiresAt = Date.now() + (expiresIn * 1000) // O tempo que foi recebido em segundos será convertido para ms
        console.log(expiresIn)
    }catch(err) {
        console.error('Ocorreu um erro: ', err)
    }
}

const verifyValidToken = async(): Promise<void> => {
    if(Date.now() > tokenExpiresAt){
        console.log("Token expirado. Buscando novo token")
        await getAcessToken()
    }
}

//Funções de busca:

//Procura pela música
const searchTrack = async(musicName: string): Promise<SpotifyApi.TrackObjectFull[]> => {
    const url: string = `https://api.spotify.com/v1/search?query=${musicName}&type=track&locale=pt-BR%2Cpt%3Bq%3D0.9&offset=0&limit=20`
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${acessToken}`
            }
        })
        const listItems: SpotifyApi.TrackObjectFull[] = response.data.tracks.items
        return listItems        
    }catch(err) {
        console.error('Ocorreu um erro: ', err)
        return [];
    }

}
//Procura pelo artista
const searchArtist = async(artistName: string): Promise<SpotifyApi.ArtistObjectFull[]> => {
    const url = `https://api.spotify.com/v1/search?query=${artistName}&type=artist&locale=pt-BR%2Cpt%3Bq%3D0.9&offset=0&limit=20`
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${acessToken}`
            }
        })
        const listItems: SpotifyApi.ArtistObjectFull[] = response.data.artists.items
        return listItems
    }catch(err) {
        console.error('Ocorreu um erro: ', err)
        return [];
    }
}
//Procura pelo álbum
const searchAlbum = async(albumName: string): Promise<SpotifyApi.AlbumObjectSimplified[]> => {
    const url = `https://api.spotify.com/v1/search?query=${albumName}&type=album&locale=pt-BR%2Cpt%3Bq%3D0.9&offset=0&limit=20`
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${acessToken}`
            }
        })
        const listItems: SpotifyApi.AlbumObjectSimplified[] = response.data.albums.items
        return listItems
    }catch(err) {
        console.error('Ocorreu um erro: ', err)
        return [];
    }
}
//Entra nos detalhes do artista
const detailsArtist = async(idArtist: string): Promise<SpotifyApi.ArtistObjectFull | null> => {
    const url = `https://api.spotify.com/v1/artists/${idArtist}`
    try {
        const response = await axios.get<SpotifyApi.ArtistObjectFull>(url, {
            headers: {
                Authorization: `Bearer ${acessToken}`
            }
        })
        return response.data
    }catch(e){
        console.error('Erro: ', e)
        return null;
    }
}
//Entra nos detalhes da música
const musicDetails = async(idMusic: string): Promise<SpotifyApi.TrackObjectFull | null> => {
    const url = `https://api.spotify.com/v1/tracks/${idMusic}`
    try {
        const response = await axios.get<SpotifyApi.TrackObjectFull>(url, {
            headers: {
                Authorization: `Bearer ${acessToken}`
            }
        })
        return response.data
    }catch(e){
        console.error('Erro: ', e)
        return null;
    }

}

//Detalhes do álbum
const albumDetails = async(idAlbum: string): Promise<SpotifyApi.AlbumObjectFull | null> => {
    const url = `https://api.spotify.com/v1/albums/${idAlbum}`
    try {
        const response = await axios.get<SpotifyApi.AlbumObjectFull>(url, {
            headers: {
                Authorization: `Bearer ${acessToken}`
            }
        })
        return response.data
    }catch(e){
        console.error(e)
        return null
    }
}

getAcessToken().then(() => {
    app.get('/token', (req, res) => {
        res.json({ acessToken })
    })
    app.get('/searchMusic/:musicName', async (req, res)=> {
        const musicName: string = req.params.musicName
        try {
            await verifyValidToken();
            const musicData: SpotifyApi.TrackObjectFull[] = await searchTrack(musicName)
            const formatted = musicData.map(item => ({
                id: item.id,
                song: item.name,
                album_type: item.album.album_type,
                album_name: item.album.name,
                artist_name: item.artists.map(artist=> ({
                    id: artist.id,
                    name: artist.name
                })),
                album_images: item.album.images.map(images => ({
                    link: images.url,
                    height: images.height,
                    width: images.width
                })),
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
            if(musicData === null) {
                res.status(404).json({message: `Music Data with the ID: ${idMusic} not found`})
            }else{
                const formatted = {
                    id: musicData.id,
                    name: musicData.name,
                    releaseDate: musicData.album.release_date,
                    artists: musicData.artists.map(artist=> ({
                        id: artist.id,
                        name: artist.name
                    })),
                    albumId: musicData.album.id,
                    albumType: musicData.album.album_type,
                    albumName: musicData.album.name,
                    orderTrack: musicData.track_number,
                    albumImages: musicData.album.images.map(images => ({
                        link: images.url,
                        height: images.height,
                        width: images.width
                    })),
                    externalLink: musicData.external_urls.spotify
                }
                res.status(200).json(formatted)
            }
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
                artist_name: item.artists.map(artist=> ({
                    id: artist.id,
                    name: artist.name
                })),
                image_url: item.images.map(images => ({
                    link: images.url,
                    height: images.height,
                    width: images.width
                })),
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
            if(albumData === null) {
                res.status(404).json({message: `Album Data with the ID: ${albumData} not found`})
            }else{
                const formatted = {
                    id: albumData.id,
                    albumType: albumData.album_type,
                    albumName: albumData.name,
                    releaseDate: albumData.release_date,
                    externalLink: albumData.external_urls.spotify,
                    albumImage: albumData.images.map(images => ({
                        link: images.url,
                        height: images.height,
                        width: images.width
                    })),
                    artists: albumData.artists.map(artist=> ({
                        id: artist.id,
                        name: artist.name
                    })),
                    tracks: albumData.tracks.items.map(track => ({
                        id: track.id,
                        name: track.name,
                        orderTrack: track.track_number
                    }))
                }
                res.status(200).json(formatted)
            }
        }catch(e){
            console.log(e)
            res.status(500).json({"erro": e})
        }
    })


    app.get('/searchArtist/:artistName', async(req, res)=> {
        const artistName: string = req.params.artistName
        try {
            await verifyValidToken();
            const artistData = await searchArtist(artistName)
            const formatted = await Promise.all(artistData.map(async (artist) => {
                const details = await detailsArtist(artist.id)
                return {
                    id: artist.id,
                    artist: artist.name,
                    image: details?.images[0]?.url
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
            if(artistData === null) {
                res.status(404).json({message: `Artist with the ID: ${idArtist} Data not found`})
            }
            res.status(200).json(artistData)
        }catch(e){
            console.log(e)
            res.status(500).json({"erro": e})
        }
    })
})

export default app;
