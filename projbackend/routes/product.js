const express = require("express");
const router = express.Router();

const {getUserById} = require("../controllers/user");
const{isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const {getProductById, createProduct , getProduct, photo , deleteProduct, updateProduct, getAllProducts, getAllProductCategory} = require("../controllers/product");

router.param("userId", getUserById);

router.param("categoryId", getProductById);

router.post("/product/create/:userId", isSignedIn, isAuthenticated, isAdmin, createProduct);

router.get("/product/:productId" , getProduct);
router.get("/product/photo/:prdouctId" , photo);

router.delete("/product/:productId/:userId", isSignedIn, isAuthenticated, isAdmin , deleteProduct);

router.put("/product/:productId/:userId", isSignedIn, isAuthenticated, isAdmin , updateProduct);

router.get("/products" , getAllProducts);

router.get("/product/categories" , getAllProductCategory);

module.exports = router;
