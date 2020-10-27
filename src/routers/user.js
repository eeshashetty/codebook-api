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

router.get('/', async(req,res) => {
    res.render('index')
})
router.get('/signup', async(req,res) => {
    res.render('signup')
})
router.get('/login', async(req,res) => {
    res.render('login')
})
router.get('/users', async(req,res) => {
    const users = await User.find()
    res.send(users)
})
router.post('/api/signup', async (req,res) => {
    const user = new User(req.body)
    try {
        await user.save()
        res.status(201).redirect(`/api/users/me?user=${user._id}`);
    } catch(e) {
        res.status(500).send(e)
    }
})


// Log In 
router.post('/api/login', async (req,res) => {
    const email = req.body.email
    const password = req.body.password
    try {
        const user = await User.findByCreds(email, password)
        const token = await user.generateAuthToken

        res.redirect(`/api/users/me?user=${user._id}`);

    } catch(e) {
        res.status(400).send(e)
    }
})

// Logout of Session
router.get('/api/users/logout', async(req, res) => {
    res.render('index')
})

// Fetch Profile Page
router.get('/api/users/me', async (req,res) => {
    const id = req.query['user']
    try {
        var posts = await Post.find({creator: id})
        const user = await User.findById(id)
        posts = posts.reverse()
        res.render('profile',{'user':user, 'posts':posts})
    } catch(e) {
        res.status(500).send(e)
    }
})

// Fetch User's Following Feed
router.get('/api/feed', async(req,res) => {
    try {
        const id = req.query['user']
        const user = await User.findById(id)
        const following = user.following
        let posts = []
        for(f of following) {
            const p = await Post.find({creator: f._id})
            posts.push(...p)
        }

        posts = posts.reverse()
       
        res.render('feed',{'user':user, 'posts':posts})
    }
    catch(e){
        res.status(400).send(e)
    }
})


router.get('/api/users/follow', async(req,res) => {
    const cid = req.query['current']
    const uid = req.query['user']
    try {
        const current = await User.findById(cid)
        const user = await User.findById(uid)
        const id = user._id
        current.following = current.following.concat(user)
        user.followers = user.followers.concat(current)
        current.save()
        user.save()
        res.status(200).redirect(`/api/users/me?user=${cid}`)
        }
    catch(e) {
        res.status(500).send(e)
    }
})

router.post('/api/users/search', async(req,res) => {
    const name = req.body.name
    const id = req.body.uid
    try{
        const u = await User.findById(id)
        var all = await User.find()
        var nofollow = []
        var follow = []
        // var nofollow = []
        for(f of u.following) {
            let user = await User.findById(f._id)
            let email = user.email
            for(x of all) {
                if(x.email === u.email)
                    continue
                if(email===x.email)
                    follow.push(x)
                else
                    nofollow.push(x)
            }
        }
        if(name != "")
        {  
            var fl = []
            var nfl = []
            for(user of all) {
                if(user.firstname.includes(name))
                    {   
                        let flag = 0
                        for(f of u.following) {
                            let user = await User.findById(f._id)
                            let email = user.email
                            if(email===user.email)
                                {fl.push(user)
                                flag++}
                            else
                                {nfl.push(user)
                                flag++}
                        }
                        if(flag===0)
                            nfl.push(user)
                        
                    }
                else if(user.lastname.includes(name))
                {   let flag = 0
                    for(f of u.following) {
                        let user = await User.findById(f._id)
                        let email = user.email
                        if(email===user.email)
                            {fl.push(user)
                            flag++}
                        else
                           { nfl.push(user)
                        flag++}
                    }   

                    if(flag===0)
                    nfl.push(user)
                }
    
            }
            nofollow = nfl
            follow = fl
        }


        res.status(200).render('follow',{'user':u, 'follow': follow, 'nofollow':nofollow})
    } catch(e) {
        res.status(500).send(e)
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
