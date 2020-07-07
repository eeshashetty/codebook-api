const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')

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
            const birthday = new Date(value)
            const age = today - birthday
            if(age/31536000000 < 13) {
                throw new Error('Under 13 years')
            }
        }

    },

    gender: {
        type: String,
        required: true
    },

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],

    pfp: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

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