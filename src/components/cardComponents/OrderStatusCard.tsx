"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { OrderDetails } from "@/types/frontend/types";

interface OrderStatusCardProps {
  order: OrderDetails;
}

const OrderStatusCard: React.FC<OrderStatusCardProps> = ({ order }) => (
  <Card className="w-full bg-white dark:bg-gray-800 shadow-md mt-4">
    <CardHeader className="bg-transparent">
      <CardTitle>Order Status</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 text-sm">
        <p>
          <strong>Order ID:</strong> {order._id}
        </p>
        <p>
          <strong>Restaurant:</strong> {order.restaurant.name}{" "}
          {order.restaurant.contactNumber && (
            <span className="text-gray-600">
              (Contact: {order.restaurant.contactNumber})
            </span>
          )}
        </p>
        {order.status && (
          <p>
            <strong>Status:</strong> {order.status}
          </p>
        )}
        {order.items && (
          <div>
            <strong>Items:</strong>
            <ul className="list-disc list-inside">
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.name || item.itemId} – {item.quantity} x ₹{item.price}{" "}
                  {item.type && `(${item.type})`}
                </li>
              ))}
            </ul>
          </div>
        )}
        {order.estimatedWaitTime !== undefined && (
          <p>
            <strong>Estimated Wait Time:</strong> {order.estimatedWaitTime} minutes
          </p>
        )}
        {order.canBeCancelled !== undefined && (
          <p>
            <strong>Cancellation:</strong>{" "}
            {order.canBeCancelled ? "Can be cancelled" : "Cannot be cancelled"}
          </p>
        )}
        <p>
          <strong>Total Amount:</strong> ₹{order.totalAmount}
        </p>
      </div>
    </CardContent>
  </Card>
);

export default OrderStatusCard;
