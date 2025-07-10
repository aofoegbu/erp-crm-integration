import { format } from 'date-fns';
import { Bot, User, Settings } from 'lucide-react';
import type { ChatMessage } from '@shared/schema';

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const isCustomer = message.sender === 'customer';
  const isAI = message.sender === 'ai';
  const isSystem = message.sender === 'system';

  const getAvatar = () => {
    if (isAI) {
      return (
        <div className="w-8 h-8 bg-gradient-to-r from-electric-blue to-neon-green rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
      );
    }
    
    if (isSystem) {
      return (
        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
          <Settings className="h-4 w-4 text-white" />
        </div>
      );
    }

    if (isCustomer) {
      return (
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-medium">
            {message.senderName.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </span>
        </div>
      );
    }

    // Agent
    return (
      <div className="w-8 h-8 bg-gradient-to-r from-neon-green to-teal-500 rounded-full flex items-center justify-center">
        <span className="text-xs text-white font-medium">
          {message.senderName.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </span>
      </div>
    );
  };

  const getMessageBg = () => {
    if (isAI) return 'bg-electric-blue/20 border border-electric-blue/30';
    if (isSystem) return 'bg-slate-800/50';
    if (message.sender === 'agent') return 'bg-neon-green/20 border border-neon-green/30';
    return 'bg-slate-700';
  };

  const getSenderBadge = () => {
    if (isAI) return <span className="px-1.5 py-0.5 bg-electric-blue/20 text-electric-blue rounded text-xs">AI Assistant</span>;
    if (message.sender === 'agent') return <span className="px-1.5 py-0.5 bg-neon-green/20 text-neon-green rounded text-xs">{message.senderName}</span>;
    return null;
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-slate-800/50 rounded-lg px-3 py-2">
          <p className="text-xs text-slate-400 flex items-center">
            <Settings className="h-3 w-3 mr-1" />
            {message.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3 slide-in">
      {getAvatar()}
      <div className="flex-1">
        <div className={`rounded-lg p-3 max-w-md ${getMessageBg()}`}>
          <p className="text-sm text-white">{message.message}</p>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <p className="text-xs text-slate-500">
            {format(new Date(message.timestamp), 'h:mm a')}
          </p>
          {getSenderBadge()}
        </div>
      </div>
    </div>
  );
}
