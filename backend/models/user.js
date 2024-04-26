const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true},
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    about: { type: String },
    profilePicture: { type: String, default: "" },
    coverPhoto: { type: String, default: "" }, 
    profileCompleted: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    timesLocked: { type: Number, default: 0 },
    lockUntil: { type: Date }
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