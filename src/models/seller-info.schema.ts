import { Schema } from "mongoose";

/**
 * Contact Methods Schema
 */
export const contactMethodsSchema = new Schema(
  {
    internalChat: { type: Boolean, default: true },
    phone: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false }
  },
  { _id: false }
);

/**
 * Payment Methods Schema
 */
export const paymentMethodsSchema = new Schema(
  {
    eWallet: { type: Boolean, default: false },
    bankTransfer: { type: Boolean, default: false },
    bankAccount: { type: String, trim: true }
  },
  { _id: false }
);

/**
 * Agreements Schema
 */
export const agreementsSchema = new Schema(
  {
    termsAccepted: { type: Boolean, default: false },
    noProhibitedItems: { type: Boolean, default: false }
  },
  { _id: false }
);

/**
 * Seller Info Schema
 */
export const sellerInfoSchema = new Schema(
  {
    shopName: { type: String, trim: true },
    tradingArea: { type: String, trim: true },
    contactMethods: contactMethodsSchema,
    paymentMethods: paymentMethodsSchema,
    agreements: agreementsSchema
  },
  { _id: false }
);

