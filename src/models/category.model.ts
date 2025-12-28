import mongoose, { Schema, type Document } from "mongoose";

/**
 * Category Interface
 */
export interface ICategory extends Document {
  name: string;
  slug: string;
  parentId?: mongoose.Types.ObjectId | null;
  level: number;
  path: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Category Schema
 */
const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true
    },
    level: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 3
    },
    path: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: 500,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
      max: 9999
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

// Indexes để tối ưu query và đảm bảo unique constraints
// 1. Unique slug (global)
categorySchema.index({ slug: 1 }, { unique: true });

// 2. Unique (parentId, name) - không cho trùng tên trong cùng parent
categorySchema.index(
  { parentId: 1, name: 1 },
  { 
    unique: true,
    partialFilterExpression: { parentId: { $ne: null } }
  }
);

// 3. Index cho query theo parentId
categorySchema.index({ parentId: 1, isActive: 1 });

// 4. Index cho query theo level
categorySchema.index({ level: 1, isActive: 1 });

// 5. Index cho query theo path (để tìm children)
categorySchema.index({ path: 1 });

export const CategoryModel = mongoose.model<ICategory>("Category", categorySchema);

