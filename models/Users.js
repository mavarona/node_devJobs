const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bcrypt = require('bcryptjs');

const usersSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expireIn: Date,
    img: String
});

usersSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

usersSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next('Ese correo ya está registrado');
    } else {
        next(error);
    }
});

usersSchema.methods = {
    comparePassword: function(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Users', usersSchema);