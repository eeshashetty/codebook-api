const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Post = require('../models/post')
const auth = require('../middleware/auth')

// Create a new Post
router.post('/api/posts', async (req,res) => {
    const user = await User.findById(req.query['user'])
    const post = new Post({
        description: req.body.description,
        likes: 0,
        creator: user._id,
        creator_name: `${user.firstname} ${user.lastname}`
    })
    try {
        const result = await post.save()
        console.log(result)
        res.status(201).redirect(`/api/users/me?user=${result.creator}`);
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/api/posts', async (req,res) => {
    try {
        const posts = await Post.find()
        res.send(posts)
    } catch(e) {
        res.status(500).send(e)
    }  
})

router.get('/api/posts/:id', auth, async (req,res) => {
    const _id = req.params.id
    try {
        const post = await Post.findOne({_id, owner: req.user._id})
        res.send(post)
    } catch (e) {
        res.status(404).send()
    }
})

router.get('/api/posts/:id/like', async (req,res) => {
    const id = req.query['user']
    try {
        const pid = req.params.id
        const post = await Post.findById(pid)
        let likes = post.likes
        post.likes = likes + 1
        // post.likes = post.likes + 1
        // console.log(post)
        // console.log(post.likes)
        await post.save()
        // if (!post) {
        //     return res.status(404).send()
        // }
        res.redirect(`/api/feed?user=${id}`)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/api/posts/:id', auth, async (req,res) => {
    try{
        const post = await Post.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if(!post){
            res.status(404).send({error: 'post not found'})
        }
        res.send(post)
    } catch(e) {
        res.status(500).send()
    }
})

module.exports = router