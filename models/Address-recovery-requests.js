const { Schema, model } = require("mongoose");

const AddressRecoveryRequestsSchema = new Schema({
    id: {
        type: String
    },
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

AddressRecoveryRequestsSchema.pre('save', function(next) {
    if (this.expiresInMinutes) {
        this.expiresAt = new Date(Date.now() + this.expiresInMinutes * 60 * 1000);
    }
    next();
});

AddressRecoveryRequestsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AddressRecoveryRequestsModel = model('Address-recovery-requests', AddressRecoveryRequestsSchema);


module.exports = { AddressRecoveryRequestsModel };