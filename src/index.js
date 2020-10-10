const express = require('express')
const bodyParser = require('body-parser')
require('./db/mongoose')

const userRouter = require('./routers/user')
const postRouter = require('./routers/post')

const app = express()
const port = process.env.PORT


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(userRouter)
app.use(postRouter)

app.listen(port, () => {
    console.log('Server is up on port '+port)
})