const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

router.post('/api/signup', async (req,res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e) {
        res.status(500).render(e)
    }
})


router.post('/api/login', async (req,res) => {
    const email = req.body.email
    const password = req.body.password
    try {
        const user = await User.findByCreds(email, password)
        const token = await user.generateAuthToken
        res.status(200).send({'message': 'Logged in successfully!', user: user})

    } catch(e) {
        res.status(400).send(e)
    }
})

module.exports = router
