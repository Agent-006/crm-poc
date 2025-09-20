import dbConnect from "@/lib/dbConnect";
import Customer from "@/model/Customer.model";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
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
    );

    console.log("Customer:", customer);

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
            message: "Customer retrieved successfully",
            customer,
        }),
        { status: 200 }
    );
}