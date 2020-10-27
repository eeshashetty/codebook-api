const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const Post = require('./post')

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Invalid email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },

    birthdate: {
        type: Date,
        required: true,
        validate(value) {
            const today = new Date()
            const age = today - value
            if(age/31536000000 < 13) {
                throw new Error('Under 13 years')
            }
        }

    },

    following: {
        type: [{
            f: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }]
    },

    followers: {
        type: [{
            follower: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }]
    },

    pfp: {
        type: Buffer
    },

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],

   
}, {
    timestamps: true
});

userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'creator'
})

userSchema.methods.generateAuthToken = async function () {
    const user = this.user
    const token = jwt.sign({_id: user._id.toString()}, 'codebook-secret')
    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

userSchema.statics.findByCreds = async (email, password) => {
    const user = await User.findOne({ email })
    if(!user) {
        throw new Error('Account does not exist')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error('Invalid password')
    }

    return user
}

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User