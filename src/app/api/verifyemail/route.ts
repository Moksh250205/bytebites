import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";
import jwt, { JwtPayload } from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { token } = reqBody;

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        } catch (err) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        const userId = decodedToken.userId;

        if (!userId) {
            return NextResponse.json({ error: "Invalid token payload: userId missing" }, { status: 400 });
        }

        const user = await User.findById(userId); 
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({
                message: "Email is already verified",
                success: true,
            });
        }

        user.isVerified = true;
        await user.save();

        return NextResponse.json({
            message: "Email verified successfully",
            success: true,
        });
    } catch (error: any) {
        console.error("Error in POST /verifyemail:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userEmail = searchParams.get("userEmail");

        if (!userEmail) {
            return NextResponse.json({ error: "Missing userEmail" }, { status: 400 });
        }

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.log("Data sent");
        return NextResponse.json(user, { status: 200 });
    } catch (error: any) {
        console.error("Error in GET /verifyemail:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
