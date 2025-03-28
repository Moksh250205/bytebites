const { connect } = require("@/dbConfig/dbConfig");
const { NextRequest, NextResponse } = require("next/server");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { chatHistory } = require("@/utils/chatHistoryStore");

const {
  getOrderStatusFunctionDeclaration,
  getRestaurantMenuFunctionDeclaration,
  searchRestaurantsFunctionDeclaration,
  createOrderFunctionDeclaration,
  searchMenuItemsFunctionDeclaration,
  findRestaurantsByItemFunctionDeclaration,
  previewOrderFunctionDeclaration,
} = require("@/utils/functionDeclarations");

const {
  getRestaurantStatus,
  calculateEstimatedWaitTime,
  canOrderBeCancelled,
  searchRestaurants,
  getRestaurantMenu,
  searchMenuItems,
  findRestaurantsByItem,
  createOrder,
  getOrderStatus,
  previewOrder,
} = require("@/app/services/chat.service");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
connect();

// Main API Handler
export async function POST(request) {
  try {
    const reqBody = await request.json();
    const { message, userId } = reqBody;

    if (!message || !userId) {
      return NextResponse.json(
        { error: "Message and userId are required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `
        You are a helpful assistant for a food ordering platform. Your capabilities include:
        1. Finding restaurants by name, cuisine, price range, rating
        2. Browsing complete menus of restaurants with filtering options
        3. Searching for specific food items across all restaurants
        4. Finding restaurants that serve specific dishes
        5. Creating and tracking orders
        
        Important guidelines:
        - For restaurant searches, always mention cuisine types and price ranges
        - For menu items, always specify if they are VEG, NON_VEG, EGG, or VEGAN
        - When handling orders, always use previewOrder first to show customization options
        - After preview, confirm all item details and customizations with user
        - If a query is ambiguous, ask for clarification
        - Always provide pricing information when mentioning menu items
        - You must respond to user with a message even when you make a function call
        - Before placing an order, confirm the preview details with the user
        - Prices are always in rupees. not in dollars.
        
        When a user asks "what restaurants do you have?", search with minimal filters to show all available options.
        When a user asks about specific cuisines or dietary preferences, use appropriate filters in your search.
        If you detect a common typo—e.g., if the image text reads 'iddly', return 'idli'—please correct it.
        You must structure the response well. under 50 words. 
        You dont need to tell the user whats available as that will be shows to user in cards it will be shared with u just for ur information. 
      `,
      tools: [
        {
          functionDeclarations: [
            searchRestaurantsFunctionDeclaration,
            getRestaurantMenuFunctionDeclaration,
            searchMenuItemsFunctionDeclaration,
            findRestaurantsByItemFunctionDeclaration,
            previewOrderFunctionDeclaration,
            createOrderFunctionDeclaration,
            getOrderStatusFunctionDeclaration,
          ],
        },
      ],
    });

    // Get existing chat history from cache and start chat
    const chat = model.startChat({
      history: chatHistory.getChatHistory(userId),
    });

    // Send message and get response
    console.log(message);
    const initialResult = await chat.sendMessage(message);

    // Store the user message and initial response in cache
    chatHistory.addMessage(userId, "user", message);
    const initialResponseText = initialResult.response.text();
    if (initialResponseText && initialResponseText.trim()) {
      chatHistory.addMessage(userId, "model", initialResponseText);
    } else {
      chatHistory.addMessage(
        userId,
        "model",
        "[Error: Empty response from model]"
      );
    }

    const functionCalls = initialResult.response.functionCalls();

    if (!functionCalls || functionCalls.length === 0) {
      return NextResponse.json({
        message: initialResult.response.text(),
        type: "text",
      });
    }

    const responses = [];

    for (const functionCall of functionCalls) {
      const { name, args } = functionCall;

      switch (name) {
        case "searchRestaurants": {
          const data = await searchRestaurants(args);
          responses.push({
            type: "restaurants",
            data,
          });
          break;
        }
        case "getRestaurantMenu": {
          const data = await getRestaurantMenu(args);
          responses.push({
            type: "menu",
            data,
          });
          break;
        }
        case "searchMenuItems": {
          const data = await searchMenuItems(args);
          responses.push({
            type: "menuItems",
            data,
          });
          break;
        }
        case "findRestaurantsByItem": {
          const data = await findRestaurantsByItem(args);
          responses.push({
            type: "restaurantsWithItems",
            data,
          });
          break;
        }
        case "previewOrder": {
          const data = await previewOrder(args);
          responses.push({
            type: "orderPreview",
            data,
          });
          break;
        }
        case "createOrder": {
          const data = await createOrder(args, userId);
          responses.push({
            type: "order",
            data,
          });
          break;
        }
        case "getOrderStatus": {
          const data = await getOrderStatus(args);
          responses.push({
            type: "orderStatus",
            data,
          });
          break;
        }
        default: {
          throw new Error(`Unknown function: ${name}`);
        }
      }
    }

    const finalResult = await chat.sendMessage(
      `Function responses: ${JSON.stringify(responses)}`
    );

    // Store the final response in cache
    const finalResponseText = finalResult.response.text();
    if (finalResponseText && finalResponseText.trim()) {
      chatHistory.addMessage(userId, "model", finalResponseText);
    } else {
      chatHistory.addMessage(
        userId,
        "model",
        "[Error: Empty response from model]"
      );
    }

    // Optional: Log cache stats in development
    if (process.env.NODE_ENV === "development") {
      console.log("Cache Stats:", chatHistory.getStats());
    }

    return NextResponse.json({
      message: finalResult.response.text(),
      responses,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
