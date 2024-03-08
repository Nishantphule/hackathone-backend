require('dotenv').config();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const SECRET_KEY = process.env.SECRET_KEY;

module.exports = {
    PORT, MONGO_URL, SECRET_KEY
}