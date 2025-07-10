import { useState } from 'react';
import { format } from 'date-fns';
import { X, User, Clock, Tag, AlertTriangle, MessageCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Ticket, Customer } from '@shared/schema';

interface TicketDetailsProps {
  ticket: Ticket;
  customer?: Customer;
  onClose: () => void;
}

export function TicketDetails({ ticket, customer, onClose }: TicketDetailsProps) {
  const [comment, setComment] = useState('');
  const [reassignAgent, setReassignAgent] = useState(ticket.assignedTo || '');
  const [showReassignInput, setShowReassignInput] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateTicket = useMutation({
    mutationFn: async (updates: Partial<Ticket>) => {
      console.log('Updating ticket with:', updates);
      const response = await apiRequest('PUT', `/api/tickets/${ticket.id}`, updates);
      const result = await response.json();
      console.log('Update result:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Mutation onSuccess called with:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update ticket. Please try again.",
        variant: "destructive"
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      case 'critical': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    console.log('handleStatusUpdate called with:', newStatus);
    updateTicket.mutate({ status: newStatus }, {
      onSuccess: () => {
        console.log('Status update onSuccess called');
        toast({
          title: "Status Updated",
          description: `Ticket status changed to ${newStatus}.`
        });
      },
      onError: (error) => {
        console.error('Status update error:', error);
      }
    });
  };

  const handlePriorityUpdate = (newPriority: string) => {
    console.log('handlePriorityUpdate called with:', newPriority);
    updateTicket.mutate({ priority: newPriority }, {
      onSuccess: () => {
        console.log('Priority update onSuccess called');
        toast({
          title: "Priority Updated", 
          description: `Ticket priority changed to ${newPriority}.`
        });
      },
      onError: (error) => {
        console.error('Priority update error:', error);
      }
    });
  };

  const handleAddComment = () => {
    console.log('handleAddComment called with comment:', comment);
    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please enter a comment before submitting.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, you'd create a comment record
    toast({
      title: "Comment Added",
      description: "Your comment has been added to the ticket."
    });
    setComment('');
  };

  const handleReassign = () => {
    console.log('handleReassign called, showReassignInput:', showReassignInput);
    if (!showReassignInput) {
      setShowReassignInput(true);
      return;
    }

    if (!reassignAgent.trim()) {
      toast({
        title: "Agent Required",
        description: "Please specify an agent to reassign to.",
        variant: "destructive"
      });
      return;
    }

    console.log('Reassigning to:', reassignAgent);
    updateTicket.mutate(
      { assignedTo: reassignAgent },
      {
        onSuccess: () => {
          console.log('Reassign onSuccess called');
          toast({
            title: "Ticket Reassigned",
            description: `Ticket has been reassigned to ${reassignAgent}.`
          });
          setShowReassignInput(false);
        },
        onError: (error) => {
          console.error('Reassign error:', error);
        }
      }
    );
  };

  const handleMarkResolved = () => {
    console.log('handleMarkResolved called');
    updateTicket.mutate(
      { 
        status: 'resolved',
        resolutionTime: Date.now() - new Date(ticket.createdAt).getTime()
      },
      {
        onSuccess: () => {
          console.log('Mark resolved onSuccess called');
          toast({
            title: "Ticket Resolved",
            description: "The ticket has been marked as resolved."
          });
        },
        onError: (error) => {
          console.error('Mark resolved error:', error);
        }
      }
    );
  };

  const handleEscalate = () => {
    console.log('handleEscalate called');
    updateTicket.mutate(
      { 
        priority: 'critical',
        assignedTo: 'Senior Support Team'
      },
      {
        onSuccess: () => {
          console.log('Escalate onSuccess called');
          toast({
            title: "Ticket Escalated",
            description: "The ticket has been escalated to the senior support team."
          });
        },
        onError: (error) => {
          console.error('Escalate error:', error);
        }
      }
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Ticket Details</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Ticket Header */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg font-semibold text-white">#{ticket.ticketNumber}</span>
            <Badge className={`bg-${ticket.priority === 'high' ? 'red' : ticket.priority === 'medium' ? 'yellow' : 'green'}-500/20 text-${ticket.priority === 'high' ? 'red' : ticket.priority === 'medium' ? 'yellow' : 'green'}-400`}>
              {ticket.priority} Priority
            </Badge>
          </div>
          <h4 className="text-white font-medium mb-4">{ticket.title}</h4>
        </div>

        {/* Ticket Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400 mb-1">Status</p>
            <div className="flex items-center space-x-2">
              {getStatusIcon(ticket.status)}
              <Select value={ticket.status} onValueChange={handleStatusUpdate}>
                <SelectTrigger className="w-full bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <p className="text-slate-400 mb-1">Priority</p>
            <Select value={ticket.priority} onValueChange={handlePriorityUpdate}>
              <SelectTrigger className="w-full bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-slate-400 mb-1">Customer</p>
            <p className="text-white">{customer?.name || 'Unknown'}</p>
            {customer?.company && (
              <p className="text-xs text-slate-400">{customer.company}</p>
            )}
          </div>

          <div>
            <p className="text-slate-400 mb-1">Assigned to</p>
            <p className="text-white">{ticket.assignedTo || 'Unassigned'}</p>
          </div>

          <div>
            <p className="text-slate-400 mb-1">Category</p>
            <Badge className="bg-blue-500/20 text-blue-400">
              {ticket.category}
            </Badge>
          </div>

          <div>
            <p className="text-slate-400 mb-1">Created</p>
            <p className="text-white">{format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-slate-400 text-sm mb-2">Description</p>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <p className="text-sm text-slate-300">{ticket.description}</p>
          </div>
        </div>

        {/* AI Classification */}
        {ticket.aiClassification && (
          <div>
            <p className="text-slate-400 text-sm mb-2">AI Classification</p>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-5 h-5 bg-gradient-to-r from-electric-blue to-neon-green rounded-full flex items-center justify-center text-xs text-white font-bold">
                  AI
                </div>
                <span className="text-sm font-medium text-slate-300">Analysis</span>
                <Badge className="bg-neon-green/20 text-neon-green text-xs">
                  Intent: {ticket.aiClassification.intent}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mb-2">
                <strong>Confidence:</strong> {(ticket.aiClassification.confidence * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-slate-400">
                <strong>Summary:</strong> {ticket.aiClassification.summary}
              </p>
            </div>
          </div>
        )}

        {/* Satisfaction Rating */}
        {ticket.satisfactionRating && (
          <div>
            <p className="text-slate-400 text-sm mb-2">Customer Satisfaction</p>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    star <= ticket.satisfactionRating! ? 'text-yellow-400' : 'text-slate-600'
                  }`}
                >
                  ★
                </span>
              ))}
              <span className="text-sm text-slate-400 ml-2">
                {ticket.satisfactionRating}/5
              </span>
            </div>
          </div>
        )}

        {/* Add Comment */}
        <div>
          <p className="text-slate-400 text-sm mb-2">Add Comment</p>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment or update..."
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            rows={3}
          />
        </div>

        {/* Reassign Agent */}
        {showReassignInput && (
          <div>
            <p className="text-slate-400 text-sm mb-2">Reassign to Agent</p>
            <div className="flex space-x-2">
              <Select value={reassignAgent} onValueChange={setReassignAgent}>
                <SelectTrigger className="flex-1 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Select agent..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="John Smith">John Smith</SelectItem>
                  <SelectItem value="Sarah Connor">Sarah Connor</SelectItem>
                  <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                  <SelectItem value="Senior Support Team">Senior Support Team</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setShowReassignInput(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-slate-700 space-y-3">
        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-electric-blue hover:bg-blue-600"
            onClick={handleAddComment}
            disabled={updateTicket.isPending}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleReassign}
            disabled={updateTicket.isPending}
          >
            <User className="h-4 w-4 mr-2" />
            {showReassignInput ? 'Confirm Reassign' : 'Reassign'}
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1 border-neon-green text-neon-green hover:bg-neon-green/10"
            onClick={handleMarkResolved}
            disabled={updateTicket.isPending || ticket.status === 'resolved'}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Resolved
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
            onClick={handleEscalate}
            disabled={updateTicket.isPending}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Escalate
          </Button>
        </div>
      </div>
    </div>
  );
}
