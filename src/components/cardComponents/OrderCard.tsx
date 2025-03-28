"use client";

import React, { useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { OrderDetails } from "@/types/frontend/types";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface OrderCardProps {
  order: OrderDetails;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const orderIdRef = useRef<HTMLParagraphElement>(null);
  const totalAmountRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    gsap.fromTo(
      [orderIdRef.current, totalAmountRef.current],
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, delay: 0.3, ease: "back.out(1.7)" }
    );
  }, []);

  return (
    <Card ref={cardRef} className="w-full bg-white dark:bg-gray-800 shadow-md mt-4">
      <CardHeader className="bg-transparent">
        <CardTitle>Order Confirmation</CardTitle>
      </CardHeader>
      <CardContent>
        <p ref={orderIdRef} className="mb-2">
          <strong>Order ID:</strong> {order._id}
        </p>
        <p className="mb-2">
          <strong>Restaurant:</strong> {order.restaurant.name}{" "}
          {order.restaurant.contactNumber && (
            <span className="text-sm text-gray-600">
              (Contact: {order.restaurant.contactNumber})
            </span>
          )}
        </p>
        {order.items && (
          <div className="mt-2">
            <h3 className="font-semibold text-sm mb-1">Items:</h3>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center border-b pb-2">
                <div>
                  <span className="text-sm">
                    {item.name || item.itemId} x{item.quantity}
                  </span>
                  {item.customizations && item.customizations.length > 0 && (
                    <div className="text-xs text-gray-600">
                      {item.customizations.map((custom, j) => (
                        <div key={j}>
                          + {custom.name} (₹{custom.price})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-sm">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        )}
        <div ref={totalAmountRef} className="mt-2">
          <strong>Total Amount:</strong> ₹{order.totalAmount}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
