const { Schema, model } = require("mongoose");

const currentDate = new Date();

const year = currentDate.getFullYear();
const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
const day = currentDate.getDate().toString().padStart(2, '0');

const dateOnly = `${day}.${month}.${year}`;

const UserContactsSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    message: {
        type: String
    },
    date: {
        type: String,
        default: dateOnly
    }
});

const AdminUserContactsModel = model('AdminUserContacts', UserContactsSchema);


module.exports = { AdminUserContactsModel };