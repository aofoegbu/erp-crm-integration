import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Plus, Video, Phone, Info, UserPlus, X } from 'lucide-react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChatInterface } from '@/components/chat/chat-interface';
import { useWebSocket } from '@/hooks/use-websocket';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { ChatSession, Customer } from '@shared/schema';

export default function Chat() {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const { sendMessage, subscribe } = useWebSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chatSessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['/api/chat-sessions'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const getCustomerById = (id: number) => customers.find(c => c.id === id);

  const activeSessions = chatSessions.filter(session => session.status === 'active');

  const createChatMutation = useMutation({
    mutationFn: async (customerId: number) => {
      return apiRequest('POST', '/api/chat-sessions', {
        customerId,
        status: 'active',
        isAIActive: true
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat-sessions'] });
      toast({
        title: "Chat Started",
        description: "New chat session has been created successfully"
      });
      setShowNewChatDialog(false);
      setSelectedCustomerId('');
      // Automatically select the new session
      response.json().then((newSession) => {
        setSelectedSession(newSession);
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start chat session. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleStartChat = () => {
    if (!selectedCustomerId) {
      toast({
        title: "Validation Error",
        description: "Please select a customer to start the chat",
        variant: "destructive"
      });
      return;
    }
    createChatMutation.mutate(parseInt(selectedCustomerId));
  };

  useEffect(() => {
    const unsubscribe = subscribe('session_update', (data: any) => {
      // Handle session updates
      console.log('Session update:', data);
    });

    return unsubscribe;
  }, [subscribe]);

  const getSessionStatus = (session: ChatSession) => {
    const timeDiff = Date.now() - new Date(session.createdAt).getTime();
    const minutesAgo = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesAgo < 5) return 'online';
    if (minutesAgo < 15) return 'warning';
    return 'error';
  };

  const formatTimeAgo = (date: Date | string) => {
    const timeDiff = Date.now() - new Date(date).getTime();
    const minutesAgo = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesAgo < 1) return 'just now';
    if (minutesAgo < 60) return `${minutesAgo} min ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    return `${Math.floor(hoursAgo / 24)}d ago`;
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Chat Interface</h2>
          <p className="text-slate-400">Real-time customer support with AI-powered chatbot assistance</p>
        </div>
        <div className="flex items-center space-x-2">
          <StatusIndicator status="online" label={`${activeSessions.length} Active Chats`} />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-6 min-h-0">
        {/* Active Chats Sidebar */}
        <div className="min-h-0">
          <GlassmorphismCard className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Active Chats</h3>
              <div className="flex items-center space-x-2">
                <StatusIndicator status="online" />
                <span className="text-xs text-slate-400">{activeSessions.length} Active</span>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {activeSessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No active chats</p>
                </div>
              ) : (
                activeSessions.map((session) => {
                  const customer = getCustomerById(session.customerId!);
                  const isSelected = selectedSession?.id === session.id;
                  
                  return (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-electric-blue/20 border border-electric-blue/50' 
                          : 'bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700'
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {customer?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || '??'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {customer?.name || 'Unknown Customer'}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {customer?.company || 'No company'}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <StatusIndicator status={getSessionStatus(session)} />
                            <span className="text-xs text-slate-400">
                              {formatTimeAgo(session.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Button 
              className="w-full mt-4 bg-electric-blue/20 text-electric-blue border border-electric-blue/30 hover:bg-electric-blue/30"
              onClick={() => setShowNewChatDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Start New Chat
            </Button>
          </GlassmorphismCard>
        </div>

        {/* Main Chat Interface */}
        <div className="col-span-3 min-h-0">
          <GlassmorphismCard className="h-full">
            {selectedSession ? (
              <ChatInterface
                sessionId={selectedSession.id}
                customer={{
                  name: getCustomerById(selectedSession.customerId!)?.name || 'Unknown Customer',
                  company: getCustomerById(selectedSession.customerId!)?.company || 'Unknown Company',
                  plan: getCustomerById(selectedSession.customerId!)?.plan || 'basic'
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Select a chat session</h3>
                  <p className="text-slate-400 mb-6">Choose an active chat from the sidebar to start conversation</p>
                  <Button 
                    className="bg-electric-blue hover:bg-blue-600"
                    onClick={() => setShowNewChatDialog(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Start New Chat
                  </Button>
                </div>
              </div>
            )}
          </GlassmorphismCard>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="mt-6 flex justify-center space-x-4">
        <Button variant="outline" size="sm">
          <Video className="mr-2 h-4 w-4" />
          Video Call
        </Button>
        <Button variant="outline" size="sm">
          <Phone className="mr-2 h-4 w-4" />
          Voice Call
        </Button>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Transfer Chat
        </Button>
        <Button variant="outline" size="sm">
          <Info className="mr-2 h-4 w-4" />
          Customer Info
        </Button>
      </div>

      {/* New Chat Dialog */}
      {showNewChatDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Start New Chat</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewChatDialog(false);
                  setSelectedCustomerId('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Customer
                </label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Choose a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-slate-400">{customer.company}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewChatDialog(false);
                    setSelectedCustomerId('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartChat}
                  disabled={createChatMutation.isPending}
                  className="flex-1 bg-electric-blue hover:bg-blue-600"
                >
                  {createChatMutation.isPending ? 'Starting...' : 'Start Chat'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
