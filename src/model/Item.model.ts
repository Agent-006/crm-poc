
import mongoose, { Schema, Document } from "mongoose";

export interface IItem extends Document {
	itemName: string;
	itemPrice: number;
	itemInventory: number;
	totalSold: number;
	createdAt: Date;
	updatedAt: Date;
}

const itemSchema: Schema<IItem> = new Schema({
	itemName: { type: String, required: true },
	itemPrice: { type: Number, required: true },
	itemInventory: { type: Number, required: true },
	totalSold: { type: Number, default: 0 },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

const Item = mongoose.models.Item || mongoose.model<IItem>("Item", itemSchema);

export default Item;
