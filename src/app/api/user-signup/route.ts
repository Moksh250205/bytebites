import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/helpers/mailer";


connect()

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { firstName , lastName, phone, email, password } = reqBody;

        if (!firstName || !lastName || !phone || !email || !password) {
            return NextResponse.json({ message: "Username, Email and Passwors are required" }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (user) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const newUser = new User({
            firstName,
            lastName, 
            phone, 
            email,
            password: password
        });

        const savedUser = await newUser.save();

        await sendEmail({ email, emailType: "VERIFY", userId: savedUser._id });

        const res = NextResponse.json({
            message: "User created successfully",
            success: true,
            firstName: firstName, 
            lastName: lastName, 
            phone: phone,
            email: email,
        })

        const tokenData = {
            id: savedUser._id,
            email: savedUser.email, 
        }

        const token = await jwt.sign(tokenData, process.env.JWT_SECRET!); 

        res.cookies.set('token', token, {
            httpOnly: true, 
            secure: true, 
            sameSite: "strict", 
        })

        return res;
    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500}); 
    }
}