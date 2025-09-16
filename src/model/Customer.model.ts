import mongoose, {Schema, Document} from "mongoose";

export interface ICustomer extends Document {
    name: string;
    email: string;
    phone: string;
    orders: mongoose.Types.ObjectId[];
    totalAmountSpent: number;
    dueAmount: number;
    advancedAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

const customerSchema: Schema<ICustomer> = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: false, unique: true },
    phone: { type: String, required: true, unique: true },
    orders: [{ type: mongoose.Types.ObjectId, ref: "Order" }],
    totalAmountSpent: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    advancedAmount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Customer = mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;
