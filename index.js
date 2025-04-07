// console.log('hellooooooo')
// three modules needed
// cors, express, dotenv
// nodemon : to automatically detect changes and re-run the server
// npm i cors express dotenv nodemon
require('dotenv').config()
const express = require('express');
const cors = require('cors');
require('./DB/connection')
const routes = require('./Routes/router')
const auctionServer = express();
auctionServer.use(cors());
auctionServer.use(express.json());
auctionServer.use(routes)
const PORT = 3000;
//  auction server should expose the uploads folder for displaying the images
auctionServer.use('/uploads',express.static('./uploads'))

auctionServer.listen(PORT, () => {
    console.log('cart server running successfully in PORT', PORT);
})
auctionServer.get('/', (req, res) => {
    res.send('<h3>Cart Server Running Successfully in port 3000</h3>')
})