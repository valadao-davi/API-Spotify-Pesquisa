import { getAcessToken } from './services/spotifyServices';
import express from 'express';
import dotenv from 'dotenv'
import musicRoutes from './routes/musicRoutes'
import artistRoutes from './routes/artistRoutes'
import albumRoutes from './routes/albumRoutes'
import playlistRoutes from './routes/playlistRoutes'

dotenv.config({path: './src/.env'})
const app = express();
app.use(express.json())


const initializeToken = async () => {
    try {
        await getAcessToken()
        console.log("Token inicializado")
    }catch(E){
        console.error("Houve um erro: ", E)
    }
}

initializeToken().then(() => {
   app.use('/music', musicRoutes)
   app.use('/artists', artistRoutes)
   app.use('/playlist', playlistRoutes)
   app.use('/album', albumRoutes)
})

export default app;
