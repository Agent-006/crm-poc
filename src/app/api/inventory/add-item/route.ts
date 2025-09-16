
import dbConnect from "@/lib/dbConnect";
import Item from "@/model/Item.model";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	await dbConnect();

	try {
		const body = await request.json();
		const { itemName, itemPrice, itemInventory } = body;

		if (!itemName || !itemPrice || !itemInventory) {
			return NextResponse.json({ message: "All fields are required: itemName, itemPrice, itemInventory." }, { status: 400 });
		}

		const newItem = new Item({
			itemName,
			itemPrice,
			itemInventory,
		});
		const savedItem = await newItem.save();

		return NextResponse.json({ message: "Item added to inventory successfully", item: savedItem }, { status: 201 });
	} catch (error: any) {
		return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
	}
}
