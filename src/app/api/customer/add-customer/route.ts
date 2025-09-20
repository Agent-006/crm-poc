
import dbConnect from "@/lib/dbConnect";
import Customer from "@/model/Customer.model";
import { NextResponse } from "next/server";
import Order from "@/model/Order.model";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { name, email, phone, order, totalAmountSpent, dueAmount, advancedAmount } = body;

        if (!name || !phone) {
            return NextResponse.json({ message: "Name and phone are required." }, { status: 400 });
        }

        let customer = await Customer.findOne({ phone });

        // If order details are provided, create order document
        let newOrder = null;
        if (order) {
            newOrder = new Order({
                ...order,
                customer: undefined, // will set after customer is created/found
            });
        }

        if (!customer) {
            // Create new customer and link order if provided
            customer = new Customer({
                name,
                email,
                phone,
                orders: [],
                totalAmountSpent: totalAmountSpent || (order?.totalAmount || 0),
                dueAmount: dueAmount || (order?.dueAmount || 0),
                advancedAmount: advancedAmount || 0,
            });
            await customer.save();
        }

        if (newOrder) {
            newOrder.customer = customer._id as import("mongoose").Types.ObjectId;
            await newOrder.save();
            customer.orders.push(newOrder._id as import("mongoose").Types.ObjectId);
            customer.totalAmountSpent = (customer.totalAmountSpent || 0) + (order.totalAmount || 0);
            customer.dueAmount = (customer.dueAmount || 0) + (order.dueAmount || 0);
            await customer.save();
        }

    const isNew = !customer || (newOrder && customer.orders.length === 1);
    return NextResponse.json({ message: isNew ? "Customer added successfully" : "Customer updated successfully", customer }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
