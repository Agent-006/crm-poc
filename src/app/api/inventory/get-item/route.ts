import dbConnect from "@/lib/dbConnect";
import Item from "@/model/Item.model";
import { NextResponse } from "next/server";

// Get all items
export async function GET() {
  await dbConnect();

  try {
    const allItems = await Item.find();

    if (!allItems || allItems.length === 0) {
      return NextResponse.json(
        { message: "No items found", items: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "All items retrieved successfully",
        items: allItems,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Get item(s) by itemName (partial, startsWith) or _id from POST body (for form usage)
export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  const { itemName, id } = body;

  if (!itemName && !id) {
    return NextResponse.json(
      { message: "itemName or id is required" },
      { status: 400 }
    );
  }

  // If id is provided, return single item
  if (id) {
    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Item found", item }, { status: 200 });
  }

  // If itemName is provided, do a case-insensitive startsWith search
  if (itemName) {
    // Use regex for startsWith, case-insensitive
    const items = await Item.find({
      itemName: { $regex: `^${itemName}`, $options: "i" },
    });
    if (!items || items.length === 0) {
      return NextResponse.json({ message: "No items found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Items found", items },
      { status: 200 }
    );
  }
}
