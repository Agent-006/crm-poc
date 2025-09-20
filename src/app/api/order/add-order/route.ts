
import dbConnect from "@/lib/dbConnect";
import Customer from "@/model/Customer.model";
import Order from "@/model/Order.model";
import { NextResponse } from "next/server";

// This api can be used to add a new order and create/find customer along with order
export async function POST(request: Request) {
	await dbConnect();

	try {
		const body = await request.json();
		const { name, email, phone, order } = body;
		console.log(name, email, phone, order);

		if (!phone || !order) {
			return NextResponse.json({ message: "Phone and order details are required." }, { status: 400 });
		}

		// Find customer by phone
		let customer = await Customer.findOne({ phone });

		// Create new order document
		const newOrder = new Order({
			...order,
			customer: undefined, // will set after customer is created/found
		});

		if (!customer) {
			// Create new customer and link order
			customer = new Customer({
				name,
				email,
				phone,
				orders: [],
				totalAmountSpent: order.totalAmount || 0,
				dueAmount: order.dueAmount || 0,
				advancedAmount: 0,
			});
			await customer.save();
		}

		// Link order to customer

	// Assign customer._id and newOrder._id as ObjectId
	newOrder.customer = customer._id as import("mongoose").Types.ObjectId;
	await newOrder.save();

	customer.orders.push(newOrder._id as import("mongoose").Types.ObjectId);
	customer.totalAmountSpent = (customer.totalAmountSpent || 0) + (order.totalAmount || 0);
	customer.dueAmount = (customer.dueAmount || 0) + (order.dueAmount || 0);
	await customer.save();

		return NextResponse.json({ message: "Order added successfully", order: newOrder, customer }, { status: 201 });
	} catch (error: any) {
		return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
	}
}
