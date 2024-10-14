
# Consumo da API Spotify para pesquisas

Este é um projeto que integra a API do Spotify para busca de músicas, artistas e álbuns, e para exibir os detalhes desses itens. A API foi construída com Express e Axios e oferece uma série de endpoints para interagir com as informações do Spotify. Essas informações são tratadas e imprimidas de forma que mostrem apenas o necessário, assim tornando o futuro desenvolvimento do projeto Soundbrary mais fácil.



## Instalação

Clone o repositório no seu computador:

```bash
 git clone https://github.com/valadao-davi/API-Spotify-Pesquisa.git
```

Navegue para o repositório:

```bash
 cd API-Spotify-Pesquisa
```

Instale as dependências:

```bash
 npm install
```


Rode a API na sua máquina com o seguinte comando:

```bash
 npm start
```
Isso iniciará na porta 3000: 'localhost:3000/'

## Variáveis de Ambiente

Para rodar esse projeto, você vai precisar adicionar as seguintes variáveis de ambiente no seu .env
Esses valores podem ser encontrados nas configurações do seu dashboard de seu perfil Spotify Developer

`SPOTIFY_CLIENT_ID`

`SPOTIFY_CLIENT_SECRET`


## Documentação da API
### Todas requisições *precisam* do token de acesso gerado após colocar suas credenciais de cliente desenvolvedor do spotify!

#### Pesquisa por músicas

```http
  GET http://localhost:3000/searchMusic/:musicName
```


#### Retorna detalhes da música

```http
  GET http://localhost:3000/musicDetails/:id
```

#### Pesquisa por álbuns

```http
  GET http://localhost:3000/searchAlbum/:albumName
```

#### Retorna detalhes do álbum

```http
  GET http://localhost:3000/searchAlbum/:id
```

#### Pesquisa por artistas

```http
  GET http://localhost:3000/searchArtist/:artistName
```


#### Retorna detalhes do artista

```http
  GET http://localhost:3000//artistDetails/:id
```

