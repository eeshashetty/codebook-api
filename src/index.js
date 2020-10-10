const express = require('express')
const path = require('path')
const hbs = require('hbs')
const bodyParser = require('body-parser')
require('./db/mongoose')

const app = express()
const port = process.env.PORT


const publicDirectoryPath = path.join(__dirname, '../public')
const viewsDirectoryPath = path.join(__dirname, '../templates/views')
const partialsDirectoryPath = path.join(__dirname, '../templates/partials')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static(publicDirectoryPath))
app.set('views', viewsDirectoryPath)
app.set('view engine', 'hbs')
hbs.registerPartials(partialsDirectoryPath)


app.listen(port, () => {
    console.log('Server is up on port '+port)
})