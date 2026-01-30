# Chatbot Setup Guide

## Overview

The chatbot uses OpenAI's ChatGPT API to provide AI-powered customer support for e-commerce related questions. It's designed to help customers with:
- Product inquiries
- Order status and tracking
- Payment methods
- Shipping and delivery
- Returns and refunds
- Account management

## Setup Instructions

### Option 1: Direct API Integration (Current Implementation)

1. **Get OpenAI API Key:**
   - Sign up at https://platform.openai.com/
   - Create an API key from the API Keys section
   - Copy your API key

2. **Configure API Key in Mobile App:**
   
   Update `app/src/services/chatbotService.ts`:
   ```typescript
   // In the constructor or create a config file
   this.apiKey = 'your-openai-api-key-here';
   ```

   **OR** create a config file `app/src/config/chatbot.ts`:
   ```typescript
   export const OPENAI_API_KEY = 'your-openai-api-key-here';
   ```

   Then import in `chatbotService.ts`:
   ```typescript
   import { OPENAI_API_KEY } from '../config/chatbot';
   this.apiKey = OPENAI_API_KEY;
   ```

3. **Add to .gitignore:**
   Make sure to add `app/src/config/chatbot.ts` to `.gitignore` to keep your API key secure.

### Option 2: Backend Proxy (Recommended for Production)

For better security, create a backend endpoint that handles ChatGPT API calls:

1. **Create Backend Endpoint** (`backend/controllers/chatbotController.js`):
   ```javascript
   import axios from 'axios';
   import ApiError from '../utils/apiError.js';
   import { successResponse } from '../utils/apiResponse.js';

   export const chatWithBot = async (req, res, next) => {
     try {
       const { message, conversationHistory = [] } = req.body;

       if (!message) {
         throw new ApiError(400, 'Message is required');
       }

       const systemPrompt = `You are a helpful customer support assistant for an e-commerce chocolate shop...`;

       const response = await axios.post(
         'https://api.openai.com/v1/chat/completions',
         {
           model: 'gpt-3.5-turbo',
           messages: [
             { role: 'system', content: systemPrompt },
             ...conversationHistory,
             { role: 'user', content: message },
           ],
           max_tokens: 150,
           temperature: 0.7,
         },
         {
           headers: {
             'Content-Type': 'application/json',
             Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
           },
         }
       );

       return successResponse(res, 200, 'Chat response generated', {
         response: response.data.choices[0]?.message?.content,
       });
     } catch (error) {
       next(error);
     }
   };
   ```

2. **Add Route** (`backend/routes/chatbotRoutes.js`):
   ```javascript
   import express from 'express';
   import { chatWithBot } from '../controllers/chatbotController.js';
   import { protect } from '../middleware/auth.js';

   const router = express.Router();
   router.post('/', protect, chatWithBot);
   export default router;
   ```

3. **Update Mobile App Service:**
   Update `app/src/services/chatbotService.ts` to call your backend instead:
   ```typescript
   async sendMessage(message: string, conversationHistory: any[] = []): Promise<string> {
     try {
       const response = await api.post('/chatbot', {
         message,
         conversationHistory,
       });
       return response.data.response || 'Sorry, I could not process your request.';
     } catch (error) {
       return this.getDefaultResponse(message);
     }
   }
   ```

## Environment Variables

### Backend (.env)
```env
OPENAI_API_KEY=your-openai-api-key-here
```

### Mobile App
For direct API integration, store the key securely in a config file (not in version control).

## Features

- **Context-Aware**: Maintains conversation history for better responses
- **E-commerce Focused**: System prompt focuses on shopping-related questions
- **Fallback Responses**: Provides helpful default responses if API fails
- **Theme Integration**: Uses app's theme colors and styling
- **Error Handling**: Graceful error handling with user-friendly messages

## Usage

The chatbot is accessible from:
- Bottom tab navigation (Chatbot tab)
- Settings screen (if enabled)

Users can ask questions about:
- Products and prices
- Order status
- Payment methods
- Delivery information
- Returns and refunds
- Account management

## Cost Considerations

OpenAI API charges based on usage:
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- Each message uses approximately 100-200 tokens
- Consider implementing rate limiting for cost control

## Security Best Practices

1. **Never expose API keys in client-side code**
2. **Use backend proxy in production**
3. **Implement rate limiting**
4. **Monitor API usage**
5. **Set usage limits in OpenAI dashboard**

## Troubleshooting

### API Key Not Working
- Verify API key is correct
- Check API key has sufficient credits
- Verify API key permissions

### No Response from API
- Check internet connectivity
- Verify API endpoint is accessible
- Check error logs for details
- Fallback responses will be used automatically

### Rate Limit Errors
- Implement request throttling
- Add retry logic with exponential backoff
- Consider upgrading OpenAI plan
