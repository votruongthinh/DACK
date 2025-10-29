const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number }],
    total: { type: Number, required: true },
    isDeleted: {type:Boolean,default:false}
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);