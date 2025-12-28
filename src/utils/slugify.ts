/**
 * Utility function để chuyển đổi tiếng Việt có dấu thành slug không dấu
 * Ví dụ: "Áo thun" → "ao-thun"
 */
export function slugify(text: string): string {
  if (!text) return "";

  // Map các ký tự tiếng Việt có dấu sang không dấu
  const vietnameseMap: Record<string, string> = {
    à: "a", á: "a", ạ: "a", ả: "a", ã: "a",
    â: "a", ầ: "a", ấ: "a", ậ: "a", ẩ: "a", ẫ: "a",
    ă: "a", ằ: "a", ắ: "a", ặ: "a", ẳ: "a", ẵ: "a",
    è: "e", é: "e", ẹ: "e", ẻ: "e", ẽ: "e",
    ê: "e", ề: "e", ế: "e", ệ: "e", ể: "e", ễ: "e",
    ì: "i", í: "i", ị: "i", ỉ: "i", ĩ: "i",
    ò: "o", ó: "o", ọ: "o", ỏ: "o", õ: "o",
    ô: "o", ồ: "o", ố: "o", ộ: "o", ổ: "o", ỗ: "o",
    ơ: "o", ờ: "o", ớ: "o", ợ: "o", ở: "o", ỡ: "o",
    ù: "u", ú: "u", ụ: "u", ủ: "u", ũ: "u",
    ư: "u", ừ: "u", ứ: "u", ự: "u", ử: "u", ữ: "u",
    ỳ: "y", ý: "y", ỵ: "y", ỷ: "y", ỹ: "y",
    đ: "d",
    À: "A", Á: "A", Ạ: "A", Ả: "A", Ã: "A",
    Â: "A", Ầ: "A", Ấ: "A", Ậ: "A", Ẩ: "A", Ẫ: "A",
    Ă: "A", Ằ: "A", Ắ: "A", Ặ: "A", Ẳ: "A", Ẵ: "A",
    È: "E", É: "E", Ẹ: "E", Ẻ: "E", Ẽ: "E",
    Ê: "E", Ề: "E", Ế: "E", Ệ: "E", Ể: "E", Ễ: "E",
    Ì: "I", Í: "I", Ị: "I", Ỉ: "I", Ĩ: "I",
    Ò: "O", Ó: "O", Ọ: "O", Ỏ: "O", Õ: "O",
    Ô: "O", Ồ: "O", Ố: "O", Ộ: "O", Ổ: "O", Ỗ: "O",
    Ơ: "O", Ờ: "O", Ớ: "O", Ợ: "O", Ở: "O", Ỡ: "O",
    Ù: "U", Ú: "U", Ụ: "U", Ủ: "U", Ũ: "U",
    Ư: "U", Ừ: "U", Ứ: "U", Ự: "U", Ử: "U", Ữ: "U",
    Ỳ: "Y", Ý: "Y", Ỵ: "Y", Ỷ: "Y", Ỹ: "Y",
    Đ: "D"
  };

  // Chuyển đổi ký tự có dấu sang không dấu
  let slug = text
    .split("")
    .map((char) => vietnameseMap[char] || char)
    .join("");

  // Chuyển thành chữ thường
  slug = slug.toLowerCase();

  // Loại bỏ các ký tự đặc biệt, chỉ giữ chữ cái, số và dấu gạch ngang
  slug = slug.replace(/[^a-z0-9\s-]/g, "");

  // Thay thế khoảng trắng và dấu gạch ngang liên tiếp bằng một dấu gạch ngang
  slug = slug.replace(/[\s-]+/g, "-");

  // Loại bỏ dấu gạch ngang ở đầu và cuối
  slug = slug.replace(/^-+|-+$/g, "");

  // Nếu slug rỗng sau khi xử lý, tạo slug từ số timestamp
  if (!slug) {
    slug = `category-${Date.now()}`;
  }

  return slug;
}


