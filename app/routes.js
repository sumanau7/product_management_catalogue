// =======================
// get the packages we need ============
// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file
var User   = require('./models/user'); // get our user model
var Product = require('./models/product'); // get our product model

// =======================
// configuration =========
// =======================

var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================
// basic route
// expose the routes to our app with module.exports
module.exports = function(app) {
    app.get('/', function(req, res) {
        res.send('Hello! The API is at http://localhost:' + port + '/api');
    });

    // Setup

    app.get('/setup', function(req, res) {

      // create a sample user
      var payjo_user = new User({ 
        name: 'payjo', 
        password: 'payjo',
        admin: true 
      });

      // save the sample user
      payjo_user.save(function(err) {
        if (err) throw err;

        console.log('User saved successfully');
        res.json({ success: true });
      });
    });

    // API ROUTES -------------------

    // get an instance of the router for api routes
    var apiRoutes = express.Router(); 


    apiRoutes.get('/', function(req, res) {
      res.json({ message: 'Welcome to the coolest API on earth!' });
    });

    apiRoutes.post('/login', function(req, res) {

      // find the user
      User.findOne({
        name: req.body.name
      }, function(err, user) {

        if (err) throw err;

        if (!user) {
          res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {

          // check if password matches
          if (user.password != req.body.password) {
            res.json({ success: false, message: 'Authentication failed. Wrong password.' });
          } else {

            // if user is found and password is right
            // create a token
            var token = jwt.sign(user, app.get('superSecret'), {
              // expiresInMinutes: 1440 // expires in 24 hours
            });

            // return the information including token as JSON
            res.json({
              success: true,
              message: 'Enjoy your token!',
              token: token
            });
          }   

        }

      });
    });

    // route middleware to verify a token
    apiRoutes.use(function(req, res, next) {

      // check header or url parameters or post parameters for token
      var token = req.body.token || req.query.token || req.headers['x-access-token'];

      // decode token
      if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
          if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });    
          } else {
            // if everything is good, save to request for use in other routes
            req.decoded = decoded;    
            next();
          }
        });

      } else {

        // if there is no token
        // return an error
        return res.status(403).send({ 
            success: false, 
            message: 'No token provided.' 
        });

      }
    });

    // route to return all users (GET http://localhost:8080/api/users)
    apiRoutes.get('/users', function(req, res) {
      User.find({}, function(err, users) {
        res.json(users);
      });
    });



    apiRoutes.route('/products')

        // create a bear (accessed at POST http://localhost:8080/api/bears)
        .post(function(req, res) {

            var bear = new Bear();      // create a new instance of the Bear model
            bear.name = req.body.name;  // set the bears name (comes from the request)
            console.log(req.body.name);
            // save the bear and check for errors
            bear.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Product created!' });
            });

        });

    apiRoutes.route('/products')
        // get all the products (accessed at GET http://localhost:8080/api/products)
        .get(function(req, res) {
            Product.find(function(err, products) {
                if (err)
                    res.send(err);

                res.json(products);
            });
        });

    // on routes that end in /products/:product_id
    // ----------------------------------------------------
    apiRoutes.route('/products/:product_id')

        // get the product with that id (accessed at GET http://localhost:8080/api/products/:product_id)
        .get(function(req, res) {
            Product.findById(req.params.product_id, function(err, product) {
                if (err)
                    res.send(err);
                res.json(product);
            });
        });

    apiRoutes.route('/products/:product_id')

        .put(function(req, res) {

            // use our bear model to find the bear we want
            Product.findById(req.params.product_id, function(err, product) {

                if (err)
                    res.send(err);

                product.name = req.body.name;  // update the product info

                // save the bear
                product.save(function(err) {
                    if (err)
                        res.send(err);

                    res.json({ message: 'Product updated!' });
                });

            });
        });

    apiRoutes.route('/products/:product_id')

        .delete(function(req, res) {
            Product.remove({
                _id: req.params.product_id
            }, function(err, bear) {
                if (err)
                    res.send(err);

                res.json({ message: 'Successfully deleted' });
            });
        });

    // apply the routes to our application with the prefix /api
    app.use('/api', apiRoutes);
}
// =======================
// start the server ======
// =======================
