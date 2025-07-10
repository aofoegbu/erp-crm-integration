import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TicketCard } from '@/components/tickets/ticket-card';
import { TicketDetails } from '@/components/tickets/ticket-details';
import { useToast } from '@/hooks/use-toast';
import type { Ticket, Customer } from '@shared/schema';

export default function Tickets() {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCreateTicket = () => {
    toast({
      title: "Create New Ticket",
      description: "Opening ticket creation form..."
    });
  };

  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets', { status: statusFilter !== 'all' ? statusFilter : undefined, priority: priorityFilter !== 'all' ? priorityFilter : undefined, search: searchQuery || undefined }],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const getCustomerById = (id: number) => customers.find(c => c.id === id);

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const autoResolvedTickets = tickets.filter(t => t.aiClassification?.intent && t.status === 'resolved').length;

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Customer Support Tickets</h2>
          <p className="text-slate-400">AI-powered ticket management with automated routing and responses</p>
        </div>
        <Button 
          className="bg-electric-blue hover:bg-blue-600"
          onClick={handleCreateTicket}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <GlassmorphismCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{openTickets}</div>
            <div className="text-sm text-slate-400 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Open Tickets
            </div>
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-neon-green">{autoResolvedTickets}</div>
            <div className="text-sm text-slate-400 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Auto-Resolved
            </div>
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{inProgressTickets}</div>
            <div className="text-sm text-slate-400 flex items-center justify-center">
              <Clock className="h-4 w-4 mr-1" />
              In Progress
            </div>
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-electric-blue">4.2/5</div>
            <div className="text-sm text-slate-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Satisfaction
            </div>
          </div>
        </GlassmorphismCard>
      </div>

      {/* Filters */}
      <GlassmorphismCard className="mb-6">
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </GlassmorphismCard>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
        {/* Tickets List */}
        <div className="col-span-2 space-y-4 overflow-y-auto">
          {tickets.length === 0 ? (
            <GlassmorphismCard>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No tickets found</h3>
                <p className="text-slate-400">No tickets match your current filters.</p>
              </div>
            </GlassmorphismCard>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                customer={getCustomerById(ticket.customerId!)}
                onSelect={setSelectedTicket}
                isSelected={selectedTicket?.id === ticket.id}
              />
            ))
          )}
        </div>

        {/* Ticket Details Panel */}
        <div className="min-h-0">
          <GlassmorphismCard className="h-full">
            {selectedTicket ? (
              <TicketDetails
                ticket={selectedTicket}
                customer={getCustomerById(selectedTicket.customerId!)}
                onClose={() => setSelectedTicket(null)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Select a ticket</h3>
                  <p className="text-slate-400">Choose a ticket from the list to view details</p>
                </div>
              </div>
            )}
          </GlassmorphismCard>
        </div>
      </div>
    </div>
  );
}
