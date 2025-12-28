/**
 * Logger utility để ghi log các hành động trong hệ thống
 */
export const logger = {
  /**
   * Ghi log hành động tạo sản phẩm
   */
  logProductCreated(productId: string, sellerId: string, productTitle: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] PRODUCT_CREATED | ProductId: ${productId} | SellerId: ${sellerId} | Title: ${productTitle}`);
    // TODO: Có thể tích hợp với logging service như Winston, Pino, hoặc gửi đến external logging service
  },

  /**
   * Ghi log các hành động khác
   */
  logAction(action: string, details: Record<string, any>) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${action}`, details);
  }
};


