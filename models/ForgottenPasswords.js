const { Schema, model } = require("mongoose");

const forgottenPasswordsSchema = new Schema({
    email: {
        type: String
    },
    code: {
        type: String
    },
    ip: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresInMinutes: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Date
    },
});

forgottenPasswordsSchema.pre('save', function(next) {
    if (this.expiresInMinutes) {
        this.expiresAt = new Date(Date.now() + this.expiresInMinutes * 60 * 1000);
    }
    next();
});

forgottenPasswordsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ForgottenPasswordsModel = model('ForgottenPasswords', forgottenPasswordsSchema);

module.exports = { ForgottenPasswordsModel };