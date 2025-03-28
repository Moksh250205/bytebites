import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

interface IRestaurant extends Document {
  name: string;
  ownerName: string;
  description: string;
  email: string;
  cuisine: string[];
  address: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  rating: number;
  priceRange: string;
  openingHours?: Map<string, { open: string; close: string }>;
  contactNumber: string;
  upiId: string;
  SocketId: string; 
  images: string[];
  isActive: boolean;
  isVerified: boolean; 
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    description: { type: String, required: true },
    email: { type: String, required: true },
    cuisine: { type: [String], required: true },
    address: {
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    },
    rating: { type: Number, default: 0 },
    priceRange: { type: String, required: true },
    openingHours: {
      type: Map,
      of: {
        open: { type: String, required: true },
        close: { type: String, required: true },
      },
    },
    contactNumber: { type: String, required: true },
    upiId: { type: String, required: true },
    SocketId: {type: String}, 
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    isVerified: {type: Boolean, default: false}, 
    password: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
  }
);

RestaurantSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

RestaurantSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const Restaurant: Model<IRestaurant> =
  mongoose.models.Restaurant || mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);

export default Restaurant;
