const mongoose = require('mongoose')

const Post = mongoose.Model('Post', mongoose.Schema({
    location: {
        type: [Number]
    },
    link: {
        type: String
    },
    embed: {
        type: String
    },
    description: {
        type: String
    },
    likes: {
        type: Number
    },
    photos: {
        type: [Buffer]
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
}))

module.exports = Post