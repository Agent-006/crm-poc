
import dbConnect from "@/lib/dbConnect";
import Item from "@/model/Item.model";
import { NextResponse } from "next/server";

// Get item by itemName or _id from POST body (for form usage)
export async function POST(request: Request) {
	await dbConnect();
	const body = await request.json();
	const { itemName, id } = body;

	if (!itemName && !id) {
		return NextResponse.json({ message: "itemName or id is required" }, { status: 400 });
	}

	let item = null;
	if (id) {
		item = await Item.findById(id);
	} else if (itemName) {
		item = await Item.findOne({ itemName });
	}

	if (!item) {
		return NextResponse.json({ message: "Item not found" }, { status: 404 });
	}

	return NextResponse.json({ message: "Item found", item }, { status: 200 });
}
