"use client";

import React, { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import RestaurantCard from "@/components/cardComponents/RestaurantCard";
import RestaurantWithItemsCard from "@/components/cardComponents/RestaurantWithItemsCard";
import MenuItemCard from "@/components/cardComponents/MenuItemCard";
import OrderPreviewCard from "@/components/cardComponents/OrderPreviewCard";
import OrderCard from "@/components/cardComponents/OrderCard";
import OrderStatusCard from "@/components/cardComponents/OrderStatusCard";
import { ChatResponse, Restaurant, FoodItem, OrderPreview, OrderDetails } from "@/types/frontend/types";

interface SearchResultsProps {
  responses: ChatResponse["responses"];
}

gsap.registerPlugin(ScrollTrigger);

const AnimatedContainer: React.FC<{ children: React.ReactNode; index: number }> = ({ children, index }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { 
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: index * 0.15,  // Stagger based on item index
        }
      );
    }
  }, []);

  return <div ref={containerRef}>{children}</div>;
};

const SearchResults: React.FC<SearchResultsProps> = ({ responses }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.group("SearchResults Component");
    console.log("Received responses:", responses);
    console.groupEnd();
  }, [responses]);

  if (!responses || responses.length === 0) {
    console.log("No responses available");
    return null;
  }

  const renderGrid = (items: any[], CardComponent: React.ComponentType<any>, propKey: string) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item, index) => (
        <AnimatedContainer key={item._id} index={index}>
          <CardComponent {...{ [propKey]: item }} />
        </AnimatedContainer>
      ))}
    </div>
  );

  return (
    <div ref={containerRef} className="space-y-8 p-4">
      {responses.map((response, responseIndex) => {
        switch (response.type) {
          case "restaurants":
            return (
              <div key={responseIndex} className="space-y-4">
                <AnimatedContainer index={responseIndex}>
                  <h2 className="text-2xl font-semibold">Available Restaurants</h2>
                </AnimatedContainer>
                {renderGrid(response.data as Restaurant[], RestaurantCard, "restaurant")}
              </div>
            );
          case "restaurantsWithItems":
            return (
              <div key={responseIndex} className="space-y-4">
                <AnimatedContainer index={responseIndex}>
                  <h2 className="text-2xl font-semibold">Restaurants Serving the Item</h2>
                </AnimatedContainer>
                {renderGrid(response.data as Restaurant[], RestaurantWithItemsCard, "restaurant")}
              </div>
            );
          case "menuItems":
          case "menu":
            const items = response.type === "menu" ? response.data.items : (response.data as FoodItem[]);
            return (
              <div key={responseIndex} className="space-y-4">
                <AnimatedContainer index={responseIndex}>
                  <h2 className="text-2xl font-semibold">Menu Items</h2>
                </AnimatedContainer>
                {renderGrid(items, MenuItemCard, "item")}
              </div>
            );
          case "orderPreview":
            return (
              <div key={responseIndex} className="max-w-2xl mx-auto">
                <AnimatedContainer index={responseIndex}>
                  <OrderPreviewCard preview={response.data as OrderPreview} />
                </AnimatedContainer>
              </div>
            );
          case "order":
            return (
              <div key={responseIndex} className="max-w-2xl mx-auto">
                <AnimatedContainer index={responseIndex}>
                  <OrderCard order={response.data as OrderDetails} />
                </AnimatedContainer>
              </div>
            );
          case "orderStatus":
            return (
              <div key={responseIndex} className="max-w-2xl mx-auto">
                <AnimatedContainer index={responseIndex}>
                  <OrderStatusCard order={response.data as OrderDetails} />
                </AnimatedContainer>
              </div>
            );
          default:
            console.log("Unknown response type:", response);
            return null;
        }
      })}
    </div>
  );
};

export default SearchResults;