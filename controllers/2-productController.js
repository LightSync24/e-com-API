// trying to apply the populate to the product so that we get the reviews associated with the product
// but we cant do so as we didnt make any connection to the reviews schema in the product schema

// and inorder to do this, we will use mongoose virtuals
// virtuals are properties that do not persist or are stored in the DB, they only exist logicall, so we create them, when we only want to create something

const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, nHits: products.length });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  // const product = await Product.findOne({ _id: productId });
  
  // using this method, we cannot query on the reviews, ie we cant get desired reviews, we will get all the reviews
  // there is another way to be able to do that
  const product = await Product.findOne({ _id: productId }).populate("reviews");
  if (!product) {
    throw new CustomError.NotFoundError(`No product with ID ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with ID ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with ID ${productId}`);
  }
  await product.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Success! Product removed" });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No File Uploaded");
  }
  const productImage = req.files.images;

  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please Upload Image");
  }

  const maxSize = 1024 * 1024;

  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload image smaller than 1MB"
    );
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
