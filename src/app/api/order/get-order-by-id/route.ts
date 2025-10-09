import dbConnect from "@/lib/dbConnect";
import Order from "@/model/Order.model";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse(
      JSON.stringify({ message: "Order ID is required" }),
      { status: 400 }
    );
  }

  try {
    const order = await Order.findById(id);
    if (!order) {
      return new NextResponse(
        JSON.stringify({ message: "Order not found" }),
        { status: 404 }
      );
    }
    return new NextResponse(
      JSON.stringify({ message: "Order retrieved successfully", order }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: "Error fetching order", error }),
      { status: 500 }
    );
  }
}