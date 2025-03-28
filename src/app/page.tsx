"use client";

import React, { useRef, useState, useEffect } from "react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import axios from "axios";

// Components
import RestaurantCard from "@/components/cardComponents/RestaurantCard";
import RestaurantWithItemsCard from "@/components/cardComponents/RestaurantWithItemsCard";
import MenuItemCard from "@/components/cardComponents/MenuItemCard";
import OrderPreviewCard from "@/components/cardComponents/OrderPreviewCard";
import OrderCard from "@/components/cardComponents/OrderCard";
import OrderStatusCard from "@/components/cardComponents/OrderStatusCard";

// Types
import type { Message, ChatResponse, Restaurant, FoodItem, OrderPreview, OrderDetails } from "@/types/frontend/types";

const ChatPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Initial AI greeting message
    setMessages([
      {
        type: "ai",
        content: "Hello! I can help you find restaurants and order food. What would you like to eat today?",
      },
    ]);
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 1,
      ease: "power3.out",
    }).from(
      ".heading-text",
      {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "back.out(1.7)",
      },
      "-=0.4"
    );
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      gsap.to(chatContainerRef.current, {
        scrollTop: chatContainerRef.current.scrollHeight,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [messages]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim() || isLoading) {
      return;
    }

    // Append user's message
    setMessages((prev) => [...prev, { type: "user", content: inputMessage }]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      const { data } = await axios.post<ChatResponse>("/api/ai/chat", {
        message: currentMessage,
        userId: "user123", // Replace with actual user ID if necessary
      });

      // Append AI's response message
      setMessages((prev) => [...prev, { type: "ai", content: data.message }]);
      
      // Add response data as cards directly in the chat flow
      if (data.responses && data.responses.length > 0) {
        setMessages((prev) => [
          ...prev,
          { type: "results", content: "", data: data.responses },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: "ai", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Component to render result cards within the chat
  const ChatResults: React.FC<{ data: ChatResponse["responses"] }> = ({ data }) => {
    return (
      <div className="space-y-4 my-3 overflow-x-hidden">
        {data.map((response, responseIndex) => {
          switch (response.type) {
            case "restaurants":
              return (
                <div key={responseIndex} className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Available Restaurants
                  </h3>
                  <div className="grid grid-cols-1 gap-3 pb-1">
                    {(response.data as Restaurant[]).map((item) => (
                      <div 
                        key={item._id} 
                        className="transition-all duration-300"
                      >
                        <RestaurantCard restaurant={item} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            case "restaurantsWithItems":
              return (
                <div key={responseIndex} className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Restaurants Serving This Item
                  </h3>
                  <div className="grid grid-cols-1 gap-3 pb-1">
                    {(response.data as Restaurant[]).map((item) => (
                      <div 
                        key={item._id} 
                        className="transition-all duration-300"
                      >
                        <RestaurantWithItemsCard restaurant={item} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            case "menuItems":
            case "menu":
              const items = response.type === "menu" ? response.data.items : (response.data as FoodItem[]);
              return (
                <div key={responseIndex} className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Menu Items
                  </h3>
                  <div className="grid grid-cols-1 gap-3 pb-1">
                    {items.map((item) => (
                      <div 
                        key={item._id} 
                        className="transition-all duration-300"
                      >
                        <MenuItemCard item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            case "orderPreview":
              return (
                <div key={responseIndex} className="w-full">
                  <OrderPreviewCard preview={response.data as OrderPreview} />
                </div>
              );
            case "order":
              return (
                <div key={responseIndex} className="w-full">
                  <OrderCard order={response.data as OrderDetails} />
                </div>
              );
            case "orderStatus":
              return (
                <div key={responseIndex} className="w-full">
                  <OrderStatusCard order={response.data as OrderDetails} />
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  // Enhanced chat messages component to handle different content types
  const EnhancedChatComponent: React.FC<{ messages: Message[] }> = ({ messages }) => {
    return (
      <div className="space-y-4">
        {messages.map((message, index) => {
          if (message.type === "user") {
            return (
              <div key={index} className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                  <p>{message.content}</p>
                </div>
              </div>
            );
          } else if (message.type === "ai") {
            return (
              <div key={index} className="flex justify-start">
                <div className="bg-muted text-muted-foreground rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                  <p>{message.content}</p>
                </div>
              </div>
            );
          } else if (message.type === "results" && message.data) {
            return (
              <div key={index} className="flex justify-start w-full">
                <div className="bg-background border border-border rounded-2xl p-3 w-[95%] shadow-sm">
                  <ChatResults data={message.data} />
                </div>
              </div>
            );
          }
          return null;
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground rounded-2xl rounded-tl-sm px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse delay-75" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse delay-150" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-dvh w-full font-serif z-10 overflow-hidden gradient-background transition-colors duration-300">
      <div className="z-0">
        <RetroGrid />
      </div>
      <div className="inset-0 gradient-overlay fixed" />
      
      <div
        ref={containerRef}
        className="relative min-h-dvh w-full flex items-center justify-center p-2 sm:p-4"
      >
        <ShineBorder className="w-full max-w-[98vw] md:max-w-xl lg:max-w-2xl">
          <div className="backdrop-blur-md bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl transition-colors duration-300">
            <div className="flex flex-col h-[calc(100vh-40px)] md:h-[80vh] p-4">
              {/* Chat Section */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
              >
                <EnhancedChatComponent messages={messages} />
              </div>

              {/* Input Section */}
              <div className="flex gap-2 pt-2 border-t border-border/40">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </ShineBorder>
      </div>
    </div>
  );
};

export default ChatPage;
