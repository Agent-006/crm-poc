import dbConnect from "@/lib/dbConnect";
import Order from "@/model/Order.model";
import { NextResponse } from "next/server";

// This api can be used to list all orders
export async function GET() {
    await dbConnect();

    const allOrders = await Order.find();

    console.log("All Orders:", allOrders);

    if (!allOrders || allOrders.length === 0) {
        return new NextResponse(
            JSON.stringify({
                message: "No orders found",
            }),
            { status: 404 }
        );
    }

    return new NextResponse(
        JSON.stringify({
            message: "All orders retrieved successfully",
            orders: allOrders,
        }),
        { status: 200 }
    );
}