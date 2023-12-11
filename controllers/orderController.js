const Order = require("../models/Order");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  // checking whether are any items in the cart
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No items in the cart");
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      "Please provide tax and shipping fee"
    );
  }

  let orderItems = [];
  let subTotal = 0;

  // we verify that all the products in the cart actually exist in the DB
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    // For each item in the cart, it performs a database query using the Product model to find a product with the specified _id
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `No product with id: ${item.product}`
      );
    }

    // after ensuring that the product exists, we set up a single order item
    const { name, price, image, _id } = dbProduct;
    // console.log(name, price, image);
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    // add item to order
    orderItems = [...orderItems, singleOrderItem];

    // calculate subtotal
    subTotal += item.amount * price;

    // console.log(orderItems);
    // console.log(subTotal);
  }

  // calculate total
  const total = tax + shippingFee + subTotal;

  // get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    orderItems,
    total,
    subTotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, nHits: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, nHits: orders.length });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;

  // if the payment goes through, we will get the payment intent ID
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  updateOrder,
};
