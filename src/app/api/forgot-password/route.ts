import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/helpers/mailer";
import {connect} from "@/dbConfig/dbConfig" 
import User from "@/models/user.model"; 

connect(); 

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { email } = reqBody;

        // Check if email is provided
        if (!email) {
            return NextResponse.json({
                error: "Email is required",
                status: 400
            });
        }

        // Check if email exists in the database
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({
                error: "User with this email does not exist",
                status: 404
            });
        }

        // Send reset password email
        const emailType = "RESET_PASSWORD"; 
        await sendEmail({ email, emailType, userId: user._id });

        return NextResponse.json({
            message: "Password reset email sent successfully",
            success: true
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            status: 500
        });
    }
}
