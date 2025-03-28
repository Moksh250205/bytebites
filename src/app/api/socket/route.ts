import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { Id, joineeType, socketId } = await req.json(); // Extracting values from body

        console.log("Received Data:", { Id, joineeType, socketId });

        return NextResponse.json({
            status: 200,
            message: "Lesgooo",
            data: { Id, joineeType, socketId } // Returning extracted data for confirmation
        });
    } catch (error) {
        return NextResponse.json({
            status: 400,
            message: "Invalid JSON request",
            error: error
        });
    }
}
