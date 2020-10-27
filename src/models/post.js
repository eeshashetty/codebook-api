const mongoose = require('mongoose')

const Post = mongoose.model('Post', mongoose.Schema({
    description: {
        type: String
    },
    likes: {
        type: Number
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    creator_name: {
        type: String
    }
}, {
    timestamps: true
}))

module.exports = Post