const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      trim: true,
      required: [true, "Please provide review text"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

// making sure that user can leave only one review per product
// it can be done in two ways: using indexing right on the schema and in the controller

// now we need to setup a compound index, for the user as well as the product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
// now, a user can leave only one review per product per user

// like creating a method, we call them on instances, however, when we use static, we can call them on the schema directly
// ReviewSchema.statics.calculateAverageRating = async function (productId) {
//   console.log(productId);
// };

// setting up the aggregate pipeline, it can be done here as well as in the GUI using mongoDB
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  // console.log(result);
  // now that we have the averageRating and numOfReviews prop, we update the product values

  console.log(result);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
  console.log("post save hook called");
});

ReviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await this.constructor.calculateAverageRating(this.product);
  }
);

module.exports = mongoose.model("Review", ReviewSchema);
