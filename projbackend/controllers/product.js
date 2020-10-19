const Product = require("../models/product");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");
const product = require("../models/product");
const { sortBy } = require("lodash");

exports.getProductById = (req,res,next,id) => {
    Product.findById(id).exec((err,product) =>{
        if(err){
            return res.status(400).json({
                error: "Category not found in DB"
            });
        }
        req.product = product;
        next();
    });
}

exports.createProduct =(req,res) =>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req,(err , fields, file) =>{
        if(err){
            return res.status(400).json({
                error: "Problem with image"
            });
        }

        const{name , description, price, category, stock} =fields;

            if(!name || !description || !price || !category || !stock){
                if(err){
                    return res.status(400).json({
                        error: "All fields are compulsary"
                    });
                }
            }

        let product = new Product(fields);
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error: "File size too Big"
                })
            }

            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;

            product.save((err, product) =>{
                if(err){
                    return res.status(400).json({
                        error: "Saving product in DB Failed"
                    });
                }
                res.json(product);       
            });
        }
    });
};

exports.getProduct = (req,res) =>{
    product.photo = undefined;
    res.json(product);
};

exports.photo = (req,res,next) =>{
    if(req.product.photo.data){
        res.set("Content-Type" , req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
};

exports.deleteProduct = (req,res) =>{
    let product = req.product;
    Product.remove((err , deletedProduct) =>{
        if(err){
           return res.status(400).json({
               error: "Unable to delete the product"
           })
        }
        res.json({
            message: "Product deleted Successfully",
            deletedProduct
        })
    })
};

exports.updateProduct = (req,res) =>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req,(err , fields, file) =>{
        if(err){
            return res.status(400).json({
                error: "Problem with image"
            });
        }

        let product = req.product;
        product = _.extend(product, fields);
        
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error: "File size too Big"
                })
            }
           
            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;

            product.save((err, product) =>{
                if(err){
                    return res.status(400).json({
                        error: "Updation of product Failed"
                    });
                }
                res.json(product);       
            });
        }
    });
};

exports.getAllProducts = (req,res) =>{
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id"; 

    Product.find().select("-photo").populate("category").sort([[sortBy,"asc"]]).limit(limit).exec((err,products) =>{
        if(err){
            return res.status(400).json({
                error: "No Products Found"
            })
        }
        res.json(products);
    });
};

exports.getAllProductCategory = (req,res) =>{
    Product.distinct("category" , {} , (err,category) =>{
        if(err){
            return res.status(400).json({
                error: "No category found"
            })
        }
        res.json(category);
    })
};

exports.updateStock = (req,res,next) =>{
    let myOperations = req.body.order.products.map(prod =>{
        return{
            updateOne: {
                filter: {_id : prod._id},
                update: {$inc : { stock : -prod.count , sold : +prod.count}}
            }
        };
    });
    Product.bulkWrite(myOperations, {} , (err,products) =>{
        if(err){
            return res.status(400).json({
                error: "Bulk operations error"
            })
        }
        next();
    })
};
