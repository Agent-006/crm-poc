import dbConnect from "@/lib/dbConnect";
import Customer from "@/model/Customer.model";
import { NextResponse } from "next/server";


// This api can be used to list all customers
export async function GET() {
    await dbConnect();

    const allCustomers = await Customer.find();

    console.log("All Customers:", allCustomers);

    if (!allCustomers || allCustomers.length === 0) {
        return new NextResponse(
            JSON.stringify({
                message: "No customers found",
            }),
            { status: 404 }
        );
    }

    return new NextResponse(
        JSON.stringify({
            message: "All customers retrieved successfully",
            customers: allCustomers,
        }),
        { status: 200 }
    );
}