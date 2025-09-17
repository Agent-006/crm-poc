import dbConnect from "@/lib/dbConnect";
import OrderItem from "@/model/OrderItem.model";
import { NextResponse } from "next/server";

// This api can be used to list the items in an order
export async function POST(request: Request) {
	await dbConnect();

	try {
		const body = await request.json();
		const { order, itemName, quantity, price, total } = body;

		if (!order || !itemName || !quantity || !price || !total) {
			return NextResponse.json({ message: "All fields are required: order, itemName, quantity, price, total." }, { status: 400 });
		}

		const newItem = new OrderItem({
			order,
			itemName,
			quantity,
			price,
			total,
		});
		const savedItem = await newItem.save();

		return NextResponse.json({ message: "Order item added successfully", item: savedItem }, { status: 201 });
	} catch (error: any) {
		return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
	}
}
