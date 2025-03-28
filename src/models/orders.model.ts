import { Schema, model, models, Types } from 'mongoose';

const orderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, ref: 'User' },
    restaurantId: { type: Types.ObjectId, required: true, ref: 'Restaurant' },
    items: [
      {
        itemId: { type: Types.ObjectId, required: true, ref: 'Item' },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        customizations: [
          {
            name: { type: String, required: true },
            price: { type: Number, required: true },
          },
        ],
      },
    ],
    totalAmount: { type: Number, required: true },
    pickupTime: { type: Date, default: null },
    payment: {
      upiId: { type: String, required: true },
      status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
      },
      transactionId: { type: String, default: null },
    },
    status: {
      type: String,
      enum: [
        'PLACED',
        'ACCEPTED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'PLACED',
    },
    orderDate: { type: Date, default: Date.now },
    specialInstructions: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Order = models.Order || model('Order', orderSchema);

export default Order;
