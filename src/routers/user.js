const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const Post = require('../models/post')

// Sign Up 
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


// Log In 
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

// Logout of Session
router.post('/api/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

// Fetch Profile Page
router.get('/api/users/me', auth, async (req,res) => {
    res.send(req.user)
})

// Fetch User's Following Feed
router.get('/api/feed', auth, async(req,res) => {
    try {
        const following = req.user.following,
        const posts = []
        following.forEach((f) => {
            const p = await Post.find({creator: f})
            posts.push(...p)
        })
        return res.status(200).send(posts)
    }
    catch(e){
        res.status(400).send(e)
    }
})

// Make any changes to user
router.patch('/api/users/me', auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','age','password']
    const isValidOperation = updates.every((update) =>  allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({error : 'Invalid updates!'})
    }
    try {
        updates.forEach((update) =>  req.user[update] = req.body[update])
        
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Delete User
router.delete('/api/users/me', auth, async (req,res) => {
    try{
        req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch(e) {
        res.status(500).send(e)
    }
})

// Uploading a Profile Picture
const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return callback(new Error('File type should be jpg, png, or jpeg'))
        }

        callback(undefined, true)
    }
})

// Upload a Profile Picture for User
router.post('/api/users/me/pfp', auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width:256, height: 256}).png().toBuffer()
    req.user['avatar'] = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

// Delete Profile Picture
router.delete('/api/users/me/pfp', auth, async (req,res) => {
    try {
        req.user['avatar'] = undefined
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router
