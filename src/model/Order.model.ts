import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
    customer: mongoose.Types.ObjectId;
    status: string;
    totalAmount: number;
    discount: number;
    remarks: string;
    paidAmount: number;
    dueAmount: number;
    modeOfPayment: string;
    items: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema: Schema<IOrder> = new Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem", required: true }],
    status: { type: String, required: false },
    totalAmount: { type: Number, required: true },
    discount: { type: Number, required: false },
    remarks: { type: String, required: false },
    paidAmount: { type: Number, required: false },
    dueAmount: { type: Number, required: false },
    modeOfPayment: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
