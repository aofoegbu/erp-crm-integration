import { format } from 'date-fns';
import { Clock, User, MessageCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Ticket, Customer } from '@shared/schema';

interface TicketCardProps {
  ticket: Ticket;
  customer?: Customer;
  onSelect: (ticket: Ticket) => void;
  isSelected: boolean;
}

export function TicketCard({ ticket, customer, onSelect, isSelected }: TicketCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'critical': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-500/20 text-yellow-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      case 'closed': return 'bg-slate-500/20 text-slate-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-500/20 text-blue-400';
      case 'billing': return 'bg-purple-500/20 text-purple-400';
      case 'general': return 'bg-green-500/20 text-green-400';
      case 'sensitive': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getBorderColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      case 'critical': return 'border-l-purple-500';
      default: return 'border-l-slate-500';
    }
  };

  return (
    <div
      className={`p-4 bg-slate-800/50 rounded-lg border-l-4 hover:bg-slate-800/70 transition-colors cursor-pointer ${getBorderColor(ticket.priority)} ${
        isSelected ? 'ring-2 ring-electric-blue' : ''
      }`}
      onClick={() => onSelect(ticket)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-white">#{ticket.ticketNumber}</span>
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority}
            </Badge>
            <Badge className={getCategoryColor(ticket.category)}>
              {ticket.category}
            </Badge>
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status.replace('_', ' ')}
            </Badge>
          </div>
          <h3 className="text-sm font-medium text-white mb-2 line-clamp-2">
            {ticket.title}
          </h3>
          <p className="text-xs text-slate-400 mb-3 line-clamp-2">
            {ticket.description}
          </p>
          
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{customer?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(ticket.createdAt), 'MMM dd, HH:mm')}</span>
            </div>
            {ticket.assignedTo && (
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>Assigned to: {ticket.assignedTo}</span>
              </div>
            )}
          </div>

          {/* AI Classification */}
          {ticket.aiClassification && (
            <div className="mt-3 p-2 bg-slate-800/50 rounded border border-slate-700">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-4 h-4 bg-gradient-to-r from-electric-blue to-neon-green rounded-full flex items-center justify-center text-xs text-white font-bold">
                  AI
                </div>
                <span className="text-xs font-medium text-slate-300">AI Analysis</span>
                <Badge className="bg-neon-green/20 text-neon-green text-xs">
                  Intent: {ticket.aiClassification.intent || 'Unknown'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                {ticket.aiClassification.summary || 'Classification pending...'}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className="flex space-x-1">
            <Button size="sm" variant="ghost">
              <MessageCircle className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost">
              <AlertTriangle className="h-3 w-3" />
            </Button>
          </div>
          {ticket.resolutionTime && (
            <div className="text-xs text-slate-500">
              SLA: {Math.floor(ticket.resolutionTime / 60)}h {ticket.resolutionTime % 60}m
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
