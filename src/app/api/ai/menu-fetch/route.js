const { connect } = require("@/dbConfig/dbConfig");
const { NextRequest, NextResponse } = require("next/server");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Menu = require("@/models/menu.model").default;
const Item = require("@/models/items.model").default;
const Restaurant = require("@/models/restaurant.model").default;
const { Types } = require("mongoose");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
connect();

const analyzeMenuItemFunctionDeclaration = {
  name: "saveMenuItem",
  description:
    "Save a single menu item, call function multiple times for adding multiple items",
  parameters: {
    type: "OBJECT",
    properties: {
      name: {
        type: "STRING",
        description: "Name of the food item",
      },
      description: {
        type: "STRING",
        description: "A concise 10-word description of the food item",
      },
      basePrice: {
        type: "NUMBER",
        description: "Base price of the item",
      },
      category: {
        type: "STRING",
        description: "Cuisine category (e.g., Chinese, Italian, Indian)",
      },
      type: {
        type: "STRING",
        enum: ["VEG", "NON_VEG", "EGG", "VEGAN"],
        description: "Type of the food item",
      },
      estimatedCalories: {
        type: "NUMBER",
        description: "Estimated calorie count per serving",
      },
      allergens: {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "List of potential allergens",
      },
      tags: {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "Relevant tags for the food item",
      },
      customizations: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "Name of the customization" },
            price: { type: "NUMBER", description: "Price for the customization" },
          },
        },
        description: "Array of customizations with name and price",
      },
    },
    required: [
      "name",
      "description",
      "basePrice",
      "category",
      "type",
      "estimatedCalories",
      "allergens",
      "tags",
      "customizations",
    ],
  },
};

const analyzePriceRangeFunctionDeclaration = {
  name: "updatePriceRange",
  description: "Analyze menu items and determine restaurant's price range",
  parameters: {
    type: "OBJECT",
    properties: {
      priceRange: {
        type: "STRING",
        description: "Price range category based on average prices and item types in INR with a NUMBER"
      },
      reasoning: {
        type: "STRING",
        description: "Brief explanation of why this price range was chosen"
      }
    },
    required: ["priceRange", "reasoning"]
  }
};

const analyzeCuisineFunctionDeclaration = {
  name: "updateCuisines",
  description: "Analyze menu items and determine restaurant's cuisine types",
  parameters: {
    type: "OBJECT",
    properties: {
      cuisines: {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "List of primary cuisine types found in the menu"
      },
      reasoning: {
        type: "STRING",
        description: "Brief explanation of why these cuisines were identified"
      }
    },
    required: ["cuisines", "reasoning"]
  }
};

export async function POST(request) {
  try {
    const reqBody = await request.json();
    const { image, restaurantId } = reqBody;

    if (!image || !restaurantId) {
      return NextResponse.json(
        { error: "Image and restaurantId are required" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurantId format" },
        { status: 400 }
      );
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const imageBytes = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `
      Analyze this menu image thoroughly for the following:
      
      1. For each menu item, identify and extract all required details using the saveMenuItem function:
         - Item name and description
         - Base price
         - Cuisine category and food type
         - Estimated calories
         - Potential allergens
         - Relevant tags
         - Customization options with prices
         - In customization u must not add anything apart from item, for example if its written add cheese u must only add Cheese
      
      2. After analyzing all items, determine the overall price range using the updatePriceRange function:
         - Consider the average prices
         - Factor in the types of dishes
         - Account for any premium ingredients or special preparations

      Analyze the provided menu image and extract each menu item’s details. For each item, please:
        
        1. **Extract the item details**: Capture the item name, description, base price, cuisine category, food type, estimated calories, allergens, tags, and customizations.
        
        2. **Standardize the item name**: Even if the text in the image has typographical errors (for example, if the image shows "iddly"), correct it to the ideal standardized name (e.g., "idli"). Ensure that the name is returned in Camel Case with proper spelling.
        
        3. Return a concise 10-word description and all other required fields exactly as specified.
        
        4. After processing all items, analyze and return the overall price range and primary cuisines using the updatePriceRange and updateCuisines functions respectively.
         
      3. Finally, identify the primary cuisines using the updateCuisines function:
         - Look for patterns in ingredients and cooking styles
         - Consider fusion elements
         - Identify main culinary traditions represented
         - Do not perform fuzzy matching based on substrings. Instead, use your understanding of common culinary terms to correct typographical errors.
         - Return the corrected, ideal name even if the text from the image contains errors.         
      
      Important notes:
      - Menu might have page headings (e.g., "Pizza" section)
      - Return menu items in Camel Case with spaces
      - For customizations, calculate price differences from base price
      - Be specific about cuisine categories
      - Consider both individual item prices and overall menu positioning for price range
      `,
      tools: [
        {
          functionDeclarations: [
            analyzeMenuItemFunctionDeclaration,
            analyzePriceRangeFunctionDeclaration,
            analyzeCuisineFunctionDeclaration
          ],
        },
      ],
    });

    const chat = model.startChat();

    const result = await chat.sendMessage([
      "Here is the image of the menu", 
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBytes.toString("base64"),
        },
      },
    ]);

    const functionCalls = result.response.functionCalls();

    if (!functionCalls || functionCalls.length === 0) {
      throw new Error("No menu items detected");
    }

    let menu = await Menu.findOne({
      restaurantId: restaurantId,
      isActive: true,
    });

    if (!menu) {
      menu = new Menu({
        restaurantId: restaurantId,
        name: `${restaurant.name}'s Menu`,
        description: `Official menu for ${restaurant.name}`,
        items: [],
        activeFrom: new Date(),
        isActive: true,
      });
    }

    const savedItems = [];
    let priceRangeAnalysis = null;
    let cuisineAnalysis = null;

    // Process all function calls
    for (const functionCall of functionCalls) {
      const { name, args } = functionCall;

      if (name === 'saveMenuItem') {
        const item = new Item({
          name: args.name,
          menuId: menu._id,
          description: args.description,
          basePrice: args.basePrice,
          category: args.category,
          type: args.type,
          tags: args.tags,
          image: null,
          customizations: args.customizations,
          nutritionalInfo: {
            calories: args.estimatedCalories,
            proteins: null,
            carbohydrates: null,
            fats: null,
          },
          allergens: args.allergens,
        });

        const savedItem = await item.save();
        savedItems.push(savedItem);
        console.log(savedItem); 
        menu.items.push({
          itemId: savedItem.id,
          name: savedItem.name, 
          isAvailable: true,
          specialInstructions: "",
        });
      } else if (name === 'updatePriceRange') {
        priceRangeAnalysis = args;
      } else if (name === 'updateCuisines') {
        cuisineAnalysis = args;
      }
    }

    // Save menu first
    menu = await menu.save();
    console.log(menu); 

    // Update restaurant and get the updated version
    let updatedRestaurant = restaurant;
    if (priceRangeAnalysis && cuisineAnalysis) {
      updatedRestaurant = await Restaurant.findByIdAndUpdate(
        restaurantId,
        {
          priceRange: priceRangeAnalysis.priceRange,
          cuisine: cuisineAnalysis.cuisines
        },
        { new: true }
      );
    }

    return NextResponse.json({
      message: "Menu items added and restaurant details updated successfully",
      success: true,
      items: savedItems.map(item => ({
        id: item._id,
        name: item.name,
        description: item.description,
        basePrice: item.basePrice,
        category: item.category,
        type: item.type,
        tags: item.tags,
        customizations: item.customizations,
        allergens: item.allergens,
      })),
      menu: {
        id: menu._id,
        name: menu.name,
        restaurantName: updatedRestaurant.name,
        itemCount: menu.items.length,
      },
    });
  } catch (error) {
    console.error("Error processing menu:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}