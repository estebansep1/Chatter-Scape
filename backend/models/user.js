const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true},
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    coverPhoto: { type: String, default: "" }, 
    profileCompleted: { type: Boolean, default: false }
}, {
    timestamps: true
})

UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12)
    }
    next();
})

module.exports = mongoose.model('User', UserSchema)