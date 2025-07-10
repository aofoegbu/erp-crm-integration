import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Activity, Users, Zap, Clock, Database, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/dashboard'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: logs } = useQuery({
    queryKey: ['/api/logs'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: tickets } = useQuery({
    queryKey: ['/api/tickets'],
  });

  const handleRefreshMonitor = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
    queryClient.invalidateQueries({ queryKey: ['/api/analytics/dashboard'] });
    toast({
      title: "Monitor Refreshed",
      description: "Real-time data has been updated"
    });
  };

  const handleSyncCustomerData = () => {
    // Simulate API call
    toast({
      title: "Customer Sync Started",
      description: "Synchronizing customer data from CRM to ERP..."
    });
  };

  const handleCreateTicket = () => {
    setLocation('/tickets');
  };

  const handleGenerateReport = () => {
    setLocation('/analytics');
  };

  const handleScheduleMaintenance = () => {
    toast({
      title: "Maintenance Scheduler",
      description: "Opening maintenance scheduling interface..."
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* System Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        <GlassmorphismCard glow>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">CRM Status</p>
              <div className="flex items-center space-x-2 mt-1">
                <StatusIndicator status="online" />
                <span className="text-lg font-semibold text-white">Online</span>
              </div>
            </div>
            <Users className="text-electric-blue text-xl" />
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">ERP Status</p>
              <div className="flex items-center space-x-2 mt-1">
                <StatusIndicator status="online" />
                <span className="text-lg font-semibold text-white">Online</span>
              </div>
            </div>
            <Database className="text-electric-blue text-xl" />
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Tickets</p>
              <div className="flex items-center space-x-2 mt-1">
                <StatusIndicator status="warning" />
                <span className="text-lg font-semibold text-white">{analytics?.tickets.open || 0}</span>
              </div>
            </div>
            <AlertTriangle className="text-electric-blue text-xl" />
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">API Calls Today</p>
              <div className="flex items-center space-x-2 mt-1">
                <StatusIndicator status="online" />
                <span className="text-lg font-semibold text-white">{analytics?.api.totalCalls || 0}</span>
              </div>
            </div>
            <Zap className="text-electric-blue text-xl" />
          </div>
        </GlassmorphismCard>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Real-time Monitoring Panel */}
        <div className="col-span-8">
          <GlassmorphismCard className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Real-time Integration Monitor</h3>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="bg-electric-blue/20 text-electric-blue hover:bg-electric-blue/30"
                  onClick={handleRefreshMonitor}
                >
                  <Activity className="mr-1 h-4 w-4" />
                  Refresh
                </Button>
                <Button size="sm" variant="outline">
                  <Clock className="mr-1 h-4 w-4" />
                  Pause
                </Button>
              </div>
            </div>
            
            {/* Integration Flow Diagram */}
            <div className="grid grid-cols-3 gap-8 items-center mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mx-auto flex items-center justify-center mb-2">
                  <Users className="text-white text-xl" />
                </div>
                <p className="text-sm text-slate-300">Salesforce CRM</p>
                <StatusIndicator status="online" label="Active" className="mt-2 justify-center" />
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-0.5 bg-electric-blue"></div>
                  <div className="w-12 h-12 bg-gradient-to-r from-electric-blue to-neon-green rounded-full flex items-center justify-center">
                    <Zap className="text-white" />
                  </div>
                  <div className="w-8 h-0.5 bg-electric-blue"></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Integration Layer</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-lg mx-auto flex items-center justify-center mb-2">
                  <Database className="text-white text-xl" />
                </div>
                <p className="text-sm text-slate-300">SAP ERP</p>
                <StatusIndicator status="online" label="Active" className="mt-2 justify-center" />
              </div>
            </div>

            {/* Recent Sync Activities */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Sync Activities</h4>
              {logs?.slice(0, 5).map((log: any) => (
                <div key={log.id} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                  <StatusIndicator 
                    status={log.status === 'success' ? 'online' : log.status === 'warning' ? 'warning' : 'error'} 
                  />
                  <div className="flex-1">
                    <p className="text-sm text-white">{log.message}</p>
                    <p className="text-xs text-slate-400">
                      {log.system.toUpperCase()} • {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs ${
                    log.status === 'success' ? 'text-neon-green' : 
                    log.status === 'warning' ? 'text-yellow-500' : 'text-red-400'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </GlassmorphismCard>
        </div>

        {/* Quick Actions Panel */}
        <div className="col-span-4">
          <GlassmorphismCard className="h-full">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start bg-electric-blue/20 hover:bg-electric-blue/30 border border-electric-blue/30"
                onClick={handleSyncCustomerData}
              >
                <Activity className="mr-3 h-4 w-4 text-electric-blue" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Sync Customer Data</p>
                  <p className="text-xs text-slate-400">Force CRM → ERP sync</p>
                </div>
              </Button>

              <Button 
                className="w-full justify-start bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/30"
                onClick={handleCreateTicket}
              >
                <AlertTriangle className="mr-3 h-4 w-4 text-neon-green" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Create Support Ticket</p>
                  <p className="text-xs text-slate-400">Manual ticket creation</p>
                </div>
              </Button>

              <Button 
                className="w-full justify-start bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30"
                onClick={handleGenerateReport}
              >
                <TrendingUp className="mr-3 h-4 w-4 text-purple-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Generate Report</p>
                  <p className="text-xs text-slate-400">Custom integration report</p>
                </div>
              </Button>

              <Button 
                className="w-full justify-start bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30"
                onClick={handleScheduleMaintenance}
              >
                <Clock className="mr-3 h-4 w-4 text-yellow-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Schedule Maintenance</p>
                  <p className="text-xs text-slate-400">Plan system downtime</p>
                </div>
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">System Health</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">API Response Time</span>
                  <span className="text-xs text-neon-green">{analytics?.api.averageResponseTime || 120}ms</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1">
                  <div className="bg-neon-green h-1 rounded-full" style={{ width: '85%' }}></div>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-slate-400">Success Rate</span>
                  <span className="text-xs text-neon-green">{analytics?.api.successRate || 99.2}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1">
                  <div className="bg-neon-green h-1 rounded-full" style={{ width: '99%' }}></div>
                </div>
              </div>
            </div>
          </GlassmorphismCard>
        </div>
      </div>
    </div>
  );
}
