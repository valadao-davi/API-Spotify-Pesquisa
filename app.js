import express from 'express';
import axios from 'axios';

const app = express();


let acessToken = ""
let refreshToken = ""

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
        
    }catch(err) {
        console.error('Ocorreu um erro: ', err)
    }
}
const getNewAcessToken = async (refreshToken) => {
    const url = "https://accounts.spotify.com/api/token"
    const data = new URLSearchParams({
        grant_type: "refresh_token",
        refreshToken: refreshToken,
        client_id: clientID,
        client_secret: clientSecret
    })

    try {
        const response = await axios.post(url, data.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        return response.data.access_token
    }catch(err) {
        console.error('Ocorreu erro: ', err)
    }
}
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
        if(e.response && response.status === 401){
            await getNewAcessToken();
            return detailsArtist(idArtist);
        }
        console.error('Erro: ', e)
    }
}



getAcessToken().then(() => {
    app.get('/token', (req, res) => {
        res.json({ acessToken })
    })
    app.get('/searchMusic/:musicName', async (req, res)=> {
        const musicName = req.params.musicName
        try {
            const musicData = await searchTrack(musicName)
            console.log(typeof(musicData))
            
            const formatted = musicData.map(item => ({
                id: item.id,
                song: item.name,
                collection_type: item.album.album_type,
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

    app.get('/searchArtist/:artistName', async(req, res)=> {
        const artistName = req.params.artistName
        try {
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
            const artistData = await detailsArtist(idArtist)
            res.status(200).json(artistData)
        }catch(e){
            console.log(e)
            res.status(500).json({"erro": e})
        }
    })
})

export default app;
