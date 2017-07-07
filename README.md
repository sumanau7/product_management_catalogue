# product_management_catalogue
Product Management minimalist framework

1. npm install
2. nodeman server.js

# Routes Expossed: </br>
## User Setup:</br>
`GET` /setup/ - Setup user with dummmy username and password: username: payjo and password: payjo </br>

## Login User to get token:</br>
`POST` /api/login/ - Login with user to get token which can be used for the rest of the session </br>

## Product Catalog:</br>
```
GET /products				- list all products
GET /products/:id			- get a specific product details
POST /products				- create a product
PUT /products/:id			- update a product entry
DELETE /products/:id		- update a product entry
```
