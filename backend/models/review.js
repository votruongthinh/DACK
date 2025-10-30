const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: { type: String,  required: true },
    userId: { type: String,  required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    reviewDate: { type: Date, default: Date.now },
    isDeleted: {type:Boolean,default:false}
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);