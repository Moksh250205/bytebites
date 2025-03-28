import { connect } from "@/dbConfig/dbConfig";
import Restaurant from "@/models/restaurant.model";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const {
            name,
            ownerName,
            description,
            email,
            contactNumber,
            upiId,
            password
        } = reqBody;

        // Check if all required fields are present
        const requiredFields = ['name', 'ownerName', 'description', 'email', 'contactNumber', 'upiId', 'password'];
        const missingFields = requiredFields.filter(field => !reqBody[field]);
        
        if (missingFields.length != 0) {
            return NextResponse.json({
                error: `Missing required fields: ${missingFields.join(', ')}`,
                status: 400
            });
        }

        // Check if email already exists
        const existingRestaurant = await Restaurant.findOne({ email });
        if (existingRestaurant) {
            return NextResponse.json({
                error: "Restaurant with this email already exists",
                status: 409
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                error: "Invalid email format",
                status: 400
            });
        }

        // Basic phone number validation (assumes Indian format)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(contactNumber)) {
            return NextResponse.json({
                error: "Invalid phone number format",
                status: 400
            });
        }

        const newRestaurant = new Restaurant({
            name,
            ownerName,
            description,
            email,
            contactNumber,
            upiId,
            password,
            cuisine: [], // Required field with empty default
            address: {   // Required field with default structure
                coordinates: {
                    latitude: 0,
                    longitude: 0
                }
            },
            priceRange: "₹", // Required field with default
            isActive: true,
            rating: 0,
            images: []
        });

        // Save the restaurant
        const savedRestaurant = await newRestaurant.save();

        // Generate JWT token
        const tokenData = {
            id: savedRestaurant._id,
            email: savedRestaurant.email
        };

        const token = await jwt.sign(
            tokenData,
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );

        // Create response
        const response = NextResponse.json({
            message: "Restaurant registered successfully",
            success: true,
            restaurant: {
                name: savedRestaurant.name,
                email: savedRestaurant.email,
                id: savedRestaurant._id, 
                contactNumber: savedRestaurant.contactNumber, 
            }
        });

        // Set JWT token in cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });

        return response;

    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({
                error: "Restaurant with this email already exists",
                status: 409
            });
        }

        return NextResponse.json({
            error: error.message,
            status: 500
        });
    }
}