const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');
const shortid = require('shortid');

const offersSchema = new mongoose.Schema({
    title: {
        type: String,
        required: 'El título de la oferta es obligatorio',
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true,
        required: 'La ubicación es obligatoría'
    },
    salary: {
        type: String,
        default: 0
    },
    contract: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true
    },
    skills: [String],
    candidates: [{
        name: String,
        email: String,
        cv: String
    }],
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: 'El autor es obligatorio'
    }
});

offersSchema.pre('save', function(next) {
    const url = slug(this.title);
    this.url = `${url}-${shortid.generate()}`;
    next();
});

offersSchema.index({
    title: 'text'
});

module.exports = mongoose.model('Offer', offersSchema);