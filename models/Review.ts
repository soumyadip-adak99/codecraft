import mongoose, { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        userName: { type: String, required: true },
        review: { type: String, required: true, minlength: 10, maxlength: 500 },
    },
    { timestamps: true }
);

const Review = models.Review || model("Review", ReviewSchema);
export default Review;
