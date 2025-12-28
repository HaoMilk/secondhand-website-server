import { z } from "zod";

/**
 * Product Condition Enum Schema
 */
const productConditionSchema = z.enum(["new-like", "very-good", "good", "fair"]);

/**
 * Schema validation cho tạo sản phẩm mới
 */
export const createProductSchema = z
  .object({
    title: z.string().min(1, "Title is required").trim(),
    description: z.string().optional(),
    categoryId: z.string().min(1, "Category ID is required"),
    brand: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    material: z.string().optional(),
    gender: z.enum(["male", "female", "unisex"]).optional(),
    style: z.string().optional(),
    price: z.number().positive("Price must be greater than 0"),
    condition: productConditionSchema,
    defects: z.string().optional(),
    defectImages: z.array(z.string().url()).optional(),
    images: z.array(z.string().url()).min(1, "At least one image is required"),
    quantity: z.number().int().min(0).default(1),
    authenticity: z.boolean().optional()
  })
  .refine(
    (data) => {
      // Nếu condition = "fair" thì defects không được rỗng
      if (data.condition === "fair" && (!data.defects || data.defects.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "Defects is required when condition is 'fair'",
      path: ["defects"]
    }
  )
  .refine(
    (data) => {
      // Nếu có defects thì phải có defectImages (ít nhất 1 ảnh)
      if (data.defects && data.defects.trim() !== "" && (!data.defectImages || data.defectImages.length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: "At least one defect image is required when defects are specified",
      path: ["defectImages"]
    }
  );

export type CreateProductInput = z.infer<typeof createProductSchema>;

