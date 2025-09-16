import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem extends Document {
    order: mongoose.Types.ObjectId;
    itemName: string;
    quantity: number;
    price: number;
    total: number;
    createdAt: Date;
    updatedAt: Date;
}

const orderItemSchema: Schema<IOrderItem> = new Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const OrderItem = mongoose.models.OrderItem || mongoose.model<IOrderItem>("OrderItem", orderItemSchema);

export default OrderItem;