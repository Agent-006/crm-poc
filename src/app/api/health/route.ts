import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await dbConnect();
        const state = mongoose.connection.readyState;
        // 1 = connected, 2 = connecting
        if (state === 1) {
            return NextResponse.json({ status: "ok", message: "Database connected" }, { status: 200 });
        } else if (state === 2) {
            return NextResponse.json({ status: "pending", message: "Database connecting" }, { status: 200 });
        } else {
            return NextResponse.json({ status: "error", message: "Database not connected" }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}
