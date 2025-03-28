"use client";

import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Restaurant } from "@/types/frontend/types";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => (
  <Card className="w-full bg-white dark:bg-gray-800 shadow-md">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="font-semibold text-lg">{restaurant.name}</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {restaurant.description}
          </p>
        </div>
        <Badge variant={restaurant.isCurrentlyOpen ? "default" : "secondary"}>
          {restaurant.isCurrentlyOpen ? "Open" : "Closed"}
        </Badge>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {restaurant.cuisine.map((cuisine, i) => (
          <Badge key={i} variant="outline">
            {cuisine}
          </Badge>
        ))}
      </div>
      <div className="mt-2">
        <span className="text-sm">
          Price Range: {"₹".repeat(restaurant.priceRange)}
        </span>
        {restaurant.rating && (
          <span className="ml-4 text-sm">Rating: {restaurant.rating}⭐</span>
        )}
      </div>
    </CardContent>
  </Card>
);

export default RestaurantCard;
