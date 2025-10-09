import dbConnect from "@/lib/dbConnect";
import Customer from "@/model/Customer.model";
import Order from "@/model/Order.model"; // <-- Add this import!
import { NextResponse } from "next/server";

// This api can be used to list the orders of a customer
export async function POST(request: Request) {
    await dbConnect();

    const body = await request.json();

    const { phone } = body;
    console.log(phone);

    if (!phone) {
        return new NextResponse(
            JSON.stringify({
                message: "Phone number is required",
            }),
            { status: 400 }
        );
    }

    const customer = await Customer.findOne(
        {
            phone,
        },
    ).populate('orders');

    console.log("Customer with Orders:", customer);

    if (!customer) {
        return new NextResponse(
            JSON.stringify({
                message: "Customer not found with the provided phone number",
            }),
            { status: 404 }
        );
    }

    return new NextResponse(
        JSON.stringify({
            message: "Customer orders retrieved successfully",
            orders: customer.orders,
            customer,
        }),
        { status: 200 }
    );
}
