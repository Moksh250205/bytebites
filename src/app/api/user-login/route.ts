import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password } = reqBody;

    if (!password || !email) {
      return NextResponse.json({ error: "Email and password are requried" }, { status: 400 })
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json({ error: "User not Found" }, { status: 404 });
    }

    const isPasswordValid = await user.comparePassword(password);
    if(!isPasswordValid){
      return NextResponse.json({error: "Invalid credentials"}, {status: 400}); 
    }

    const tokenData = {
      id: user._id, 
      email: user.email
    }

    const token = await jwt.sign(tokenData, process.env.JWT_SECRET!);

    const res = NextResponse.json({
      message: "Login successful",
      success: true, 
      username: user.username, 
      email: user.email
    })

    res.cookies.set('token', token, {
      httpOnly: true, 
      secure: true,
      sameSite: "strict",
    })

    return res; 

  }
  catch (error: any) {
    return NextResponse.json({error: error.message}, {status: 500}); 
  }
}