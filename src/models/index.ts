/**
 * Models Index
 * Export tất cả models và schemas để dễ import
 */

// User models
export { UserModel, type IUser, type UserRole } from "./user.model.js";

// Shipping Address model
export { ShippingAddressModel, type IShippingAddress } from "./shipping-address.model.js";

// Profile schemas
export { profileSchema, profileAddressSchema } from "./profile.schema.js";

// Seller Info schemas
export {
  sellerInfoSchema,
  contactMethodsSchema,
  paymentMethodsSchema,
  agreementsSchema
} from "./seller-info.schema.js";

// Product model
export { ProductModel, type IProduct, type ProductCondition, type ProductStatus } from "./product.model.js";

// Category model
export { CategoryModel, type ICategory } from "./category.model.js";

