"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";

export default function VerifyEmail() {
    const [token, setToken] = useState("");
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(false);

    const verifyUserEmail = async () => {
        if (!token) return;
        try {
            await axios.post('/api/verifyemail', { token });
            setVerified(true);
        } catch (error: any) {
            setError(true);
            console.log(error.response.data);
        }
    };

    useEffect(() => {
        const urlToken = window.location.search.split("=")[1];
        const decode = decodeURI(urlToken);
        setToken(decode || "");
    }, []);

    useEffect(() => {
        if (token.length > 0) {
            verifyUserEmail();
        }
    }, [token]);

    return (
        <div className="flex flex-col items-center text-center justify-center min-h-screen py-2 bg-[#e80432]">
            <div className="bg-white shadow-lg rounded-lg p-8 w-11/12 max-w-md">
                <h1 className="text-4xl text-[#e80432] font-bold mb-4">Verify Email</h1>

                {verified && (
                    <div className="mb-4">
                        <h2 className="text-2xl text-[#28a745] font-semibold">Email Verified Successfully!</h2>
                        <p className="text-gray-600">You can now proceed to login.</p>
                    </div>
                )}
                {error && (
                    <div className="mb-4">
                        <h2 className="text-2xl bg-red-500 text-white rounded p-2">Error: Unable to verify email.</h2>
                    </div>
                )}
                <div className="mt-4">
                    <a href="/dashboard" className="bg-[#e80432] text-white w-full px-4 py-2 rounded hover:bg-[#d70329] transition duration-200">
                        Go to Home
                    </a>
                </div>
            </div>
        </div>
    );
}