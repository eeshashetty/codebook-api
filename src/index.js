const express = require('express')
const path = require('path')
const hbs = require('hbs')
const bodyParser = require('body-parser')
require('./db/mongoose')

const User = require('./models/user')

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

app.get('/', (req,res) => {
    res.status(200).render('index')
})

app.get('/login', (req,res) => {
    res.status(200).render('login')
})

app.get('/signup', (req,res) => {
    res.status(200).render('signup')
})

app.post('/signup', async (req,res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e) {
        res.status(500).render(e)
    }
})

app.post('/feed', async (req,res) => {
    const email = req.body.email
    const password = req.body.password
    try {
        const user = await User.findByCreds(email, password)
        const token = await user.generateAuthToken
        res.render('feed', {user: user})

    } catch(e) {
        res.status(400).send(e)
    }
})

app.listen(port, () => {
    console.log('Server is up on port '+port)
})