import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessageComponent } from './chat-message';
import { useChat } from '@/hooks/use-chat';

interface ChatInterfaceProps {
  sessionId: number;
  customer: {
    name: string;
    company: string;
    plan: string;
  };
}

export function ChatInterface({ sessionId, customer }: ChatInterfaceProps) {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isTyping, sendChatMessage, sendTypingIndicator } = useChat(sessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    sendChatMessage.mutate({
      message: messageInput,
      sender: 'agent',
      senderName: 'Agent'
    });

    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    sendTypingIndicator('agent');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-sm text-white font-medium">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{customer.name}</h3>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>{customer.company}</span>
              <span>•</span>
              <span>{customer.plan}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-neon-green rounded-full status-online"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <ChatMessageComponent key={message.id} message={message} />
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <div className="bg-slate-700 rounded-lg p-3 max-w-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">Typing...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex space-x-3">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Smile className="h-4 w-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 pr-12"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Responses */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessageInput('Thank you for your patience')}
          >
            Thank you for your patience
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessageInput('Let me check that for you')}
          >
            Let me check that for you
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessageInput('Can you provide more details?')}
          >
            Can you provide more details?
          </Button>
        </div>
      </div>
    </div>
  );
}
