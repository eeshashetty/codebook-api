const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
require('./db/mongoose')

const User = require('./models/user')

const app = express()
const port = process.env.PORT
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static(publicDirectoryPath))

app.get('/', (req,res) => {
    res.status(200).render('index.html')
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

app.post('/login', async (req,res) => {
    const email = req.body.email
    const password = req.body.password
    try {
        const user = await User.findByCreds(email, password)
        const token = await user.generateAuthToken
        res.send({user, token})

    } catch(e) {
        res.status(400).send(e)
    }
})

app.listen(port, () => {
    console.log('Server is up on port '+port)
})