import { z } from "zod";

/**
 * Schema validation cho tạo category mới
 */
export const createCategorySchema = z
  .object({
    name: z
      .string()
      .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
      .max(60, "Tên danh mục không được vượt quá 60 ký tự")
      .trim()
      .refine(
        (val) => {
          // Không cho phép chỉ toàn ký tự đặc biệt
          const hasLetterOrNumber = /[a-zA-Z0-9À-ỹ]/.test(val);
          return hasLetterOrNumber;
        },
        {
          message: "Tên danh mục phải chứa ít nhất một chữ cái hoặc số"
        }
      ),
    parentId: z
      .string()
      .nullable()
      .optional()
      .transform((val) => (val === "" || val === null ? null : val)),
    description: z
      .string()
      .max(500, "Mô tả không được vượt quá 500 ký tự")
      .optional()
      .nullable(),
    sortOrder: z
      .number()
      .int("Thứ tự sắp xếp phải là số nguyên")
      .min(0, "Thứ tự sắp xếp phải lớn hơn hoặc bằng 0")
      .max(9999, "Thứ tự sắp xếp không được vượt quá 9999")
      .default(0),
    isActive: z.boolean().default(true)
  })
  .strict();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

