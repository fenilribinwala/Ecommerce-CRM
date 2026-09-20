import mongoose from 'mongoose';
import config from 'config';
import logger from '../logging/logger'

let dbConnection;

let getDBConnection = async() => {
    try {
        let connectionOptions = {
            user: process.env.VENIQA_MONGODB_USER,
            pass: process.env.VENIQA_MONGODB_PASSWORD,
            dbName: process.env.VENIQA_MONGODB_DB,
        }

        // Establish a mongoose connection to mongodb
        dbConnection = await mongoose.connect(process.env.VENIQA_MONGODB_URL, connectionOptions);
        logger.info("MongoDB connection was successful");
    }
    catch(err) {
        logger.error("Error connecting to the database", {meta: err})
    }
    return dbConnection;
}

// Initializing the models and registering them to their models
require("./models/tariffRate");
require("./models/productCategory");
require("./models/product")
require("./models/user");

// Exporting the connection
exports.dbConnection = () => getDBConnection();
