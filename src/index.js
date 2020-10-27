const express = require('express')
const hbs = require('hbs')
const bodyParser = require('body-parser')
const path = require('path')
require('./db/mongoose')

const userRouter = require('./routers/user')
const postRouter = require('./routers/post')

const app = express()
const port = process.env.PORT || 3000



app.set('trust proxy', true)

const publicDirectoryPath = path.join(__dirname, '../public')
const viewsDirectoryPath = path.join(__dirname, '../templates/views')
const partialsDirectoryPath = path.join(__dirname, '../templates/partials')

app.set('views', viewsDirectoryPath)
app.set('view engine', 'hbs')
hbs.registerPartials(partialsDirectoryPath)

app.use(express.static(publicDirectoryPath))
app.use(bodyParser.urlencoded({extended: true}))

app.use(userRouter)
app.use(postRouter)

app.listen(port, () => {
    console.log('Server is up on port '+port)
})