const mongoose = require('mongoose');

const {MONGODB_URL} = process.env;

async function start(){
    try{
        await mongoose.connect(MONGODB_URL, {
            serverSelectionTimeoutMS: 30000,
        });

        mongoose.connection.on('connected', () => {
            console.log('Mongoose успешно подключился к MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Ошибка подключения Mongoose:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose отключился от MongoDB');
        });
        console.log("База данных подключена...");
    }catch (e) {
        console.log('Ошибка подключения к базе данных:', e.message);
    }
}

module.exports = start;

