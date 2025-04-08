// console.log('hellooooooo')
// three modules needed
// cors, express, dotenv
// nodemon : to automatically detect changes and re-run the server
// npm i cors express dotenv nodemon
const routes = require('./Routes/router')
require('dotenv').config()
const express = require('express');
require('./DB/connection');
const cors = require('cors');
const auctionServer = express();
auctionServer.use(cors());
auctionServer.use(express.json());
auctionServer.use(routes);
//  auction server should expose the uploads folder for displaying the images
auctionServer.use('/uploads',express.static('./uploads'))
const PORT = 3000;
auctionServer.listen(PORT, () => {
    console.log('cart server running successfully in PORT', PORT);
})
auctionServer.get('/', (req, res) => {
    res.send('<h3>Cart Server Running Successfully in port 3000</h3>')
})