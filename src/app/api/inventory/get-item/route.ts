
import dbConnect from "@/lib/dbConnect";
import Item from "@/model/Item.model";
import { NextResponse } from "next/server";

// Get item(s) by itemName (partial, startsWith) or _id from POST body (for form usage)
export async function POST(request: Request) {
	await dbConnect();
	const body = await request.json();
	const { itemName, id } = body;

	if (!itemName && !id) {
		return NextResponse.json({ message: "itemName or id is required" }, { status: 400 });
	}

	// If id is provided, return single item
	if (id) {
		const item = await Item.findById(id);
		if (!item) {
			return NextResponse.json({ message: "Item not found" }, { status: 404 });
		}
		return NextResponse.json({ message: "Item found", item }, { status: 200 });
	}

	// If itemName is provided, do a case-insensitive startsWith search
	if (itemName) {
		// Use regex for startsWith, case-insensitive
		const items = await Item.find({ itemName: { $regex: `^${itemName}`, $options: "i" } });
		if (!items || items.length === 0) {
			return NextResponse.json({ message: "No items found" }, { status: 404 });
		}
		return NextResponse.json({ message: "Items found", items }, { status: 200 });
	}
}
