// access verification is done by using jwtmiddleware
const jwt = require('jsonwebtoken');
const jwtMiddleware = (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        console.log('token:...', token);
        const jwtResponse = jwt.verify(token,process.env.JWTSECRET);
        console.log('jwtresponse',jwtResponse);
        req.payload = jwtResponse.userId;
        next();
    }
    catch (err) {
        res.status(401).json('Authorization failed, please login...')
    }
}
module.exports = jwtMiddleware;