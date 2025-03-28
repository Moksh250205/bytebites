import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Order from "@/models/orders.model";
import Restaurant from "@/models/restaurant.model";
import { Types } from "mongoose";
import { sendSocketMessage } from "@/lib/socket";

connect();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, restaurantId, items, totalAmount, specialInstructions } = body;

    // Validate required fields
    if (!userId || !restaurantId || !items || !totalAmount) {
      return NextResponse.json(
        { error: "userId, restaurantId, items, and totalAmount are required" },
        { status: 400 }
      );
    }

    // Validate ObjectId formats
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid userId or restaurantId format" },
        { status: 400 }
      );
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Create new order
    const order = new Order({
      userId,
      restaurantId,
      items,
      totalAmount,
      specialInstructions,
      status: 'PLACED',
      payment: {
        upiId: '',
        status: 'PENDING'
      }
    });

    await order.save();

    sendSocketMessage(restaurantId, 'order-created', order); 

    return NextResponse.json(
      {
        message: "Order created successfully",
        success: true,
        order
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}