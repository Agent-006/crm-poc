import dbConnect from "@/lib/dbConnect";
import Customer from "@/model/Customer.model";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnect();

    const body = await request.json();
    const { id } = body;
    console.log(id);

    if (!id) {
        return new NextResponse(
            JSON.stringify({
                message: "Customer ID is required",
            }),
            { status: 400 }
        );
    }

    try {
        const customer = await Customer.findById(id);
    
        console.log("Customer:", customer);
    
        if (!customer) {
            return new NextResponse(
                JSON.stringify({
                    message: "Customer not found with the provided ID",
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
    } catch (error: any) {
        console.error("Error retrieving customer:", error);
        return new NextResponse(
            JSON.stringify({
                message: "Error retrieving customer",
                error: error.message,
            }),
            { status: 500 }
        );
    }

}