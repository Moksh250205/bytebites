"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { OrderPreview } from "@/types/frontend/types";

interface OrderPreviewCardProps {
  preview: OrderPreview;
}

const OrderPreviewCard: React.FC<OrderPreviewCardProps> = ({ preview }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  return (
    <Card ref={cardRef} className="w-full bg-white dark:bg-gray-800 shadow-md mt-4">
      <CardHeader className="bg-transparent">
        <CardTitle>Order Preview - {preview.restaurant.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {preview.items.map((item, i) => (
            <div key={i} className="flex justify-between items-start border-b pb-2">
              <div>
                <p className="font-medium">
                  {item.name} x{item.quantity}
                </p>
                {item.selectedCustomizations?.map((custom, j) => (
                  <p key={j} className="text-sm text-gray-600">
                    + {custom.name} (₹{custom.price})
                  </p>
                ))}
              </div>
              <p className="font-medium">₹{item.subtotal}</p>
            </div>
          ))}
          <div className="pt-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{preview.pricing.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span>₹{preview.pricing.platformFee}</span>
            </div>
            <div className="flex justify-between font-bold mt-2">
              <span>Total</span>
              <span>₹{preview.pricing.total}</span>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              Estimated Wait Time: {preview.estimatedWaitTime} minutes
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderPreviewCard;
