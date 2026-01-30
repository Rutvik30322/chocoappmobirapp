import axios from 'axios';

// OpenAI API Configuration
// Note: For production, use a backend endpoint to keep API key secure
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// You can set your OpenAI API key here or via setApiKey method
// For better security, use a backend endpoint instead
// Get your API key from: https://platform.openai.com/api-keys
const DEFAULT_API_KEY = ''; // Set your OpenAI API key here

// System prompt for ecommerce chatbot
const SYSTEM_PROMPT = `You are a helpful customer support assistant for an e-commerce chocolate shop. 
Your role is to assist customers with:
- Product inquiries (chocolates, flavors, prices, availability)
- Order status and tracking
- Shipping and delivery information
- Payment methods (Razorpay, Cash on Delivery)
- Returns and refunds
- Account and profile management
- General questions about the chocolate shop

Be friendly, professional, and concise. If you don't know something, politely direct the customer to contact support.
Always focus on e-commerce and chocolate-related topics.`;

class ChatbotService {
  private apiKey: string;

  constructor() {
    // API key should be set via setApiKey method or use DEFAULT_API_KEY
    // For security, consider using a backend endpoint instead
    this.apiKey = DEFAULT_API_KEY;
  }

  /**
   * Set OpenAI API key
   * @param key - OpenAI API key
   */
  setApiKey(key: string) {
    this.apiKey = key;
  }

  /**
   * Send message to ChatGPT API
   * @param message - User's message
   * @param conversationHistory - Previous messages for context
   * @returns AI response
   */
  async sendMessage(
    message: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<string> {
    try {
      // If no API key, return a default response
      if (!this.apiKey) {
        return this.getDefaultResponse(message);
      }

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: message },
      ];

      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 10000,
        }
      );

      return response.data.choices[0]?.message?.content || 'Sorry, I could not process your request.';
    } catch (error: any) {
      console.error('ChatGPT API Error:', error);
      // Return default response on error
      return this.getDefaultResponse(message);
    }
  }

  /**
   * Get default response when API is not available
   */
  private getDefaultResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Ecommerce-related responses
    if (lowerMessage.includes('order') || lowerMessage.includes('track')) {
      return 'You can check your order status in the "My Orders" section. For detailed tracking, please contact our support team.';
    }

    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return 'We accept payments via Razorpay (credit/debit cards, UPI, net banking) and Cash on Delivery (COD).';
    }

    if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
      return 'We deliver to all major cities. Delivery time is typically 3-5 business days. You can add your delivery address in the "Delivery Address" section.';
    }

    if (lowerMessage.includes('product') || lowerMessage.includes('chocolate')) {
      return 'We offer a wide variety of premium chocolates. Browse our catalog to see all available products with prices and descriptions.';
    }

    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return 'For returns and refunds, please contact our support team. We have a 7-day return policy for unopened products.';
    }

    if (lowerMessage.includes('cart') || lowerMessage.includes('add to cart')) {
      return 'You can add products to your cart from the product detail page. View and manage your cart from the cart icon.';
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'Product prices are displayed on each product page. Prices may vary by product and category.';
    }

    if (lowerMessage.includes('discount') || lowerMessage.includes('offer')) {
      return 'We regularly offer discounts and special offers. Check our product pages for current promotions.';
    }

    // Default response
    return 'I\'m here to help with your chocolate shopping needs! You can ask me about products, orders, payments, delivery, or any other questions. How can I assist you?';
  }
}

export default new ChatbotService();
