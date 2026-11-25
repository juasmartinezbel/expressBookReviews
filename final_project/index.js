const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const ERROR_AUTHENTICATED = "User not authenticated";
const ERROR_LOGGED = "User not logged in"

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    const { session } = req;
    if(session && session.authorization){
        let token = session.authorization['accessToken'];

        jwt.verify(token, "access", (err, user) => {
            if(err) {
                return  res.status(403).json({message: ERROR_AUTHENTICATED})
            }
            req.user = user;
            next();
        })
    } else {
        return res.status(403).json({message: ERROR_LOGGED});
    }
});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
