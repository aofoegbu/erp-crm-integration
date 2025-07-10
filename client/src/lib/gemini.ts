import { GoogleGenAI } from "@google/genai";

// Using Google Gemini AI as a free alternative
const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "demo-key"
});

export interface IntentClassification {
  intent: string;
  confidence: number;
  priority: string;
  summary: string;
  suggestedActions?: string[];
}

export interface ChatResponse {
  message: string;
  shouldEscalate: boolean;
  confidence: number;
}

export async function classifyCustomerIntent(message: string): Promise<IntentClassification> {
  try {
    const systemPrompt = `You are an intent classifier for customer support in an ERP/CRM integration platform. 
          
          Classify the customer message into one of these categories:
          - technical: Technical issues with integrations, API errors, sync problems
          - billing: Payment issues, subscription questions, pricing inquiries  
          - general: General questions about features, how-to guides, documentation
          - sensitive: Complaints, escalations, data privacy concerns, security issues
          - complex_technical: Complex integration issues requiring specialist knowledge
          
          Also determine priority (low, medium, high, critical) and provide a brief summary.
          For high priority or sensitive issues, suggest escalation actions.
          
          Respond with JSON format: {
            "intent": "category",
            "confidence": 0.95,
            "priority": "medium",
            "summary": "brief summary",
            "suggestedActions": ["action1", "action2"]
          }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            confidence: { type: "number" },
            priority: { type: "string" },
            summary: { type: "string" },
            suggestedActions: { 
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["intent", "confidence", "priority", "summary"]
        }
      },
      contents: message
    });

    const rawJson = response.text;
    if (rawJson) {
      const result = JSON.parse(rawJson);
      return {
        intent: result.intent || 'general',
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        priority: result.priority || 'medium',
        summary: result.summary || 'Unable to classify',
        suggestedActions: result.suggestedActions || []
      };
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error('Intent classification error:', error);
    return {
      intent: 'general',
      confidence: 0.5,
      priority: 'medium',
      summary: 'Classification failed - manual review required'
    };
  }
}

export async function generateChatbotResponse(
  customerMessage: string, 
  classification: IntentClassification,
  conversationHistory?: string[]
): Promise<ChatResponse> {
  try {
    const contextualPrompt = `You are a helpful customer support AI for an ERP/CRM integration platform.
    
    Customer message classification:
    - Intent: ${classification.intent}
    - Priority: ${classification.priority}
    - Confidence: ${(classification.confidence * 100).toFixed(1)}%
    
    Guidelines:
    - For technical issues: Provide initial troubleshooting steps and offer escalation
    - For billing: Give general information but escalate for account-specific details
    - For general questions: Provide helpful information and links to documentation
    - For sensitive issues: Be empathetic and escalate to human agent immediately
    - For complex technical: Acknowledge complexity and escalate to specialist
    
    Keep responses professional, concise, and helpful. If the issue requires human intervention, suggest escalation.
    
    Previous conversation context: ${conversationHistory?.join('\n') || 'None'}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: contextualPrompt
      },
      contents: customerMessage
    });

    const aiMessage = response.text || "I understand your concern. Let me connect you with a human agent who can provide detailed assistance.";
    
    // Determine if escalation is needed
    const shouldEscalate = 
      classification.intent === 'sensitive' ||
      classification.intent === 'complex_technical' ||
      classification.priority === 'high' ||
      classification.priority === 'critical' ||
      classification.confidence < 0.7;

    return {
      message: aiMessage,
      shouldEscalate,
      confidence: classification.confidence
    };
  } catch (error) {
    console.error('Chatbot response generation error:', error);
    return {
      message: "I'm having trouble processing your request right now. Let me connect you with a human agent who can help you immediately.",
      shouldEscalate: true,
      confidence: 0
    };
  }
}

export async function generateTicketSummary(description: string): Promise<string> {
  try {
    const systemPrompt = "Generate a concise, professional summary of this customer support ticket. Focus on the key issue and any important details. Keep it under 100 words.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt
      },
      contents: description
    });

    return response.text || description.substring(0, 100) + "...";
  } catch (error) {
    console.error('Ticket summary generation error:', error);
    return description.substring(0, 100) + "...";
  }
}

export async function suggestTicketResolution(ticketDescription: string, category: string): Promise<string[]> {
  try {
    const systemPrompt = `You are an expert in ERP/CRM integration support. Based on the ticket description and category, suggest 3-5 specific resolution steps or actions. 
          
          Category: ${category}
          
          Respond with JSON format: {
            "suggestions": ["step1", "step2", "step3"]
          }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["suggestions"]
        }
      },
      contents: ticketDescription
    });

    const rawJson = response.text;
    if (rawJson) {
      const result = JSON.parse(rawJson);
      return result.suggestions || ['Review ticket details', 'Contact customer for more information', 'Escalate to technical team'];
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error('Resolution suggestion error:', error);
    return ['Review ticket details', 'Contact customer for more information', 'Check system logs'];
  }
}

export const geminiService = {
  classifyCustomerIntent,
  generateChatbotResponse,
  generateTicketSummary,
  suggestTicketResolution
};