import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Database, Plug, Activity, CheckCircle, Clock, Settings, Plus, Calendar } from 'lucide-react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScheduleMaintenanceModal } from '@/components/maintenance/schedule-maintenance-modal';
import { useToast } from '@/hooks/use-toast';

export default function Integrations() {
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: customers } = useQuery({ queryKey: ['/api/customers'] });
  const { data: crmOrders } = useQuery({ queryKey: ['/api/crm/customers'] });
  const { data: erpOrders } = useQuery({ queryKey: ['/api/erp/orders'] });
  const { data: erpInventory } = useQuery({ queryKey: ['/api/erp/inventory'] });

  const handleTestCrmConnection = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/crm/customers'] });
    toast({
      title: "CRM Connection Test",
      description: "Testing Salesforce CRM connection..."
    });
  };

  const handleTestErpConnection = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/erp/orders'] });
    queryClient.invalidateQueries({ queryKey: ['/api/erp/inventory'] });
    toast({
      title: "ERP Connection Test", 
      description: "Testing SAP ERP connection..."
    });
  };

  const handleConfigureWorkflow = (workflowName: string) => {
    toast({
      title: `${workflowName} Configuration`,
      description: `Opening configuration panel for ${workflowName}...`
    });
  };

  const handleSendApiRequest = () => {
    toast({
      title: "API Request Sent",
      description: "Executing API test request..."
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">System Integrations</h2>
          <p className="text-slate-400">Manage CRM and ERP connections with automated workflows</p>
        </div>
        <Button 
          className="bg-electric-blue hover:bg-blue-600"
          onClick={() => setShowMaintenanceModal(true)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Maintenance
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {/* CRM Integration Panel */}
        <GlassmorphismCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">CRM Integration (Salesforce)</h3>
            <StatusIndicator status="online" label="Connected" />
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">API Endpoints</h4>
              <div className="space-y-2 text-xs terminal-font">
                <div className="flex justify-between">
                  <span className="text-electric-blue">GET /api/crm/customers</span>
                  <span className="text-neon-green">200 OK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-electric-blue">POST /api/crm/leads</span>
                  <span className="text-neon-green">201 Created</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-electric-blue">PUT /api/crm/opportunities</span>
                  <span className="text-neon-green">200 OK</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Recent Data Sync</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Customers</span>
                  <span className="text-white">{customers?.length || 0} records</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Leads</span>
                  <span className="text-white">83 records</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Opportunities</span>
                  <span className="text-white">156 records</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-electric-blue hover:bg-blue-600"
              onClick={handleTestCrmConnection}
            >
              <Plug className="mr-2 h-4 w-4" />
              Test Connection
            </Button>
          </div>
        </GlassmorphismCard>

        {/* ERP Integration Panel */}
        <GlassmorphismCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">ERP Integration (SAP)</h3>
            <StatusIndicator status="online" label="Connected" />
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">API Endpoints</h4>
              <div className="space-y-2 text-xs terminal-font">
                <div className="flex justify-between">
                  <span className="text-electric-blue">GET /api/erp/orders</span>
                  <span className="text-neon-green">200 OK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-electric-blue">GET /api/erp/inventory</span>
                  <span className="text-neon-green">200 OK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-electric-blue">POST /api/erp/financials</span>
                  <span className="text-neon-green">201 Created</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Recent Data Sync</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Orders</span>
                  <span className="text-white">892 records</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Inventory</span>
                  <span className="text-white">3,421 items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Financials</span>
                  <span className="text-white">245 transactions</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-neon-green hover:bg-green-600"
              onClick={handleTestErpConnection}
            >
              <Plug className="mr-2 h-4 w-4" />
              Test Connection
            </Button>
          </div>
        </GlassmorphismCard>
      </div>

      {/* Integration Workflows */}
      <GlassmorphismCard>
        <h3 className="text-lg font-semibold text-white mb-4">Integration Workflows</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 border border-slate-600 rounded-lg hover:border-electric-blue/50 transition-colors">
            <div className="flex items-center space-x-3 mb-3">
              <Activity className="text-electric-blue" />
              <h4 className="font-medium text-white">Customer Sync</h4>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Bidirectional customer data synchronization between CRM and ERP systems.
            </p>
            <div className="flex justify-between items-center">
              <Badge className="bg-neon-green/20 text-neon-green">Active</Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleConfigureWorkflow('Customer Sync')}
              >
                <Settings className="mr-1 h-3 w-3" />
                Configure
              </Button>
            </div>
          </div>

          <div className="p-4 border border-slate-600 rounded-lg hover:border-electric-blue/50 transition-colors">
            <div className="flex items-center space-x-3 mb-3">
              <Database className="text-electric-blue" />
              <h4 className="font-medium text-white">Order Processing</h4>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Automated order creation and status updates across both systems.
            </p>
            <div className="flex justify-between items-center">
              <Badge className="bg-neon-green/20 text-neon-green">Active</Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleConfigureWorkflow('Order Processing')}
              >
                <Settings className="mr-1 h-3 w-3" />
                Configure
              </Button>
            </div>
          </div>

          <div className="p-4 border border-slate-600 rounded-lg hover:border-electric-blue/50 transition-colors">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="text-electric-blue" />
              <h4 className="font-medium text-white">Inventory Sync</h4>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Real-time inventory level updates from ERP to CRM for accurate sales data.
            </p>
            <div className="flex justify-between items-center">
              <Badge className="bg-yellow-500/20 text-yellow-500">Paused</Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleConfigureWorkflow('Inventory Sync')}
              >
                <Settings className="mr-1 h-3 w-3" />
                Configure
              </Button>
            </div>
          </div>
        </div>
      </GlassmorphismCard>

      {/* API Testing Console */}
      <GlassmorphismCard>
        <h3 className="text-lg font-semibold text-white mb-4">API Testing Console</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Request</label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <select className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
                <input 
                  type="text" 
                  placeholder="/api/crm/customers" 
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 text-sm"
                />
                <Button 
                  className="bg-electric-blue hover:bg-blue-600"
                  onClick={handleSendApiRequest}
                >
                  Send
                </Button>
              </div>
              <textarea 
                placeholder="Request body (JSON)" 
                rows={8}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 text-sm terminal-font"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Response</label>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 h-64 overflow-y-auto">
              <pre className="text-xs text-slate-300 terminal-font">
{`{
  "status": "success",
  "data": {
    "customers": [
      {
        "id": "cust_123",
        "name": "John Smith",
        "email": "john@example.com",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "total": 150,
      "has_more": true
    }
  },
  "response_time": "245ms"
}`}
              </pre>
            </div>
          </div>
        </div>
      </GlassmorphismCard>

      <ScheduleMaintenanceModal 
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
      />
    </div>
  );
}
