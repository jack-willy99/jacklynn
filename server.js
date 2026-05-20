const express = require('express')
const cors = require('cors')
const yts = require('yt-search')
const ytdl = require('@distube/ytdl-core')

const app = express()

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hoshino Music API Running 😭🔥')
})

app.get('/search', async (req, res) => {

  try {

    const q = req.query.q

    if (!q) {
      return res.json({
        status: false,
        message: 'query kosong'
      })
    }

    const search = await yts(q)

    const videos = search.videos.slice(0, 10)

    const result = videos.map(v => ({
      title: v.title,
      url: v.url,
      thumbnail: v.thumbnail,
      duration: v.timestamp,
      author: v.author.name
    }))

    res.json({
      status: true,
      result
    })

  } catch (e) {

    res.json({
      status: false,
      error: e.message
    })

  }

})

app.get('/play', async (req, res) => {

  try {

    const url = req.query.url

    if (!url) {
      return res.json({
        status: false,
        message: 'url kosong'
      })
    }

    const info = await ytdl.getInfo(url)

    const format = ytdl.chooseFormat(
      info.formats,
      {
        quality: 'highestaudio',
        filter: 'audioonly'
      }
    )

    res.json({
      status: true,
      result: {
        title: info.videoDetails.title,
        audio: format.url,
        thumbnail:
          info.videoDetails.thumbnails.pop().url
      }
    })

  } catch (e) {

    res.json({
      status: false,
      error: e.message
    })

  }

})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})