const express = require('express')
const router = new express.Router()
const Post = require('../models/post')
const auth = require('../middleware/auth')

// Create a new Post
router.post('/api/posts', auth, async (req,res) => {
    const post = new Post({
        ...req.body,
        owner: req.user
    })
    try {
        const result = await post.save()
        res.status(201).send(result)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/api/posts', auth, async (req,res) => {
    const match = {}
    const sort = {}

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1]==='desc'? -1 : 1
            
    }
    try {
        await req.user.populate({
            path: 'posts',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.posts)
    } catch (e) {
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

router.patch('/api/posts/:id/like', auth, async (req,res) => {
    try {
        const post = await Post.findOne({_id})
        post[likes] += 1
        await post.save()
        if (!post) {
            return res.status(404).send()
        }
        res.send(post)
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