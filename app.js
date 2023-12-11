require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();

// rest of the packages
const morgan = require("morgan"); // it tells the route we are hitting
const cookieParser = require("cookie-parser"); // for accessing the cookie in the server (2-authController.js)
const fileUpload = require("express-fileupload"); // for uploading images

const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

// connect to the DB
const connectDB = require("./db/connect");

//routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");

// middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler"); // this middleware should be invoked in the end (as per express rules)

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);

app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(morgan("tiny")); // calling upon this middleware
app.use(express.json()); // acess to json data in req.body
// app.use(cookieParser());
app.use(cookieParser(process.env.JWT_SECRET)); // signing the cookie

app.use(express.static("./public"));
app.use(fileUpload());


// app.get("/", (req, res) => {
//   res.status(200).send("E-com-api");
// });

app.get("/api/v1/", (req, res) => {
  // console.log(req.cookies); // beofre signing the cookie
  console.log(req.signedCookies);
  res.status(200).send("E-com-api");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    // await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
