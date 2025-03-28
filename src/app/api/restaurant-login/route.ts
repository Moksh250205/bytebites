import { connect } from "@/dbConfig/dbConfig";
import Restaurant from "@/models/restaurant.model";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password } = reqBody;

    if (!password || !email) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const restaurant = await Restaurant.findOne({ email }).select("+password");
    
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not Found" },
        { status: 404 }
      );
    }

    const isPasswordValid = await restaurant.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const tokenData = {
      id: restaurant._id,
      email: restaurant.email
    };

    const token = await jwt.sign(
      tokenData,
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }  // Optional: add token expiration
    );

    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      name: restaurant.name,
      email: restaurant.email
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}