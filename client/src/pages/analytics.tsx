import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Clock, CheckCircle, AlertTriangle, Users, Zap, Star, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const { toast } = useToast();
  
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/dashboard'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['/api/tickets'],
  });

  const { data: apiMetrics = [] } = useQuery({
    queryKey: ['/api/analytics/api-metrics'],
  });

  const handleExport = () => {
    // Generate CSV data
    const csvData = [
      ['Date', 'API Calls', 'Success Rate', 'Avg Response Time', 'Tickets Created', 'Tickets Resolved'],
      ['2025-01-10', '1,247', '99.2%', '234ms', '12', '8'],
      ['2025-01-09', '1,189', '99.8%', '221ms', '15', '11'],
      ['2025-01-08', '1,356', '98.9%', '267ms', '9', '13'],
      ['2025-01-07', '1,298', '99.1%', '245ms', '18', '16'],
      ['2025-01-06', '1,423', '99.6%', '198ms', '7', '12'],
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Completed",
      description: "Analytics report has been downloaded as CSV file"
    });
  };

  // Calculate metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t: any) => t.status === 'open').length;
  const resolvedTickets = tickets.filter((t: any) => t.status === 'resolved').length;
  const autoResolvedTickets = tickets.filter((t: any) => t.status === 'resolved' && t.aiClassification).length;

  const avgResponseTime = analytics?.api?.averageResponseTime || 234;
  const successRate = analytics?.api?.successRate || 99.8;
  const totalApiCalls = analytics?.api?.totalCalls || 15247;
  const errorRate = (100 - successRate).toFixed(1);

  // Chart data
  const responseTimeData = [
    { time: '00:00', responseTime: 245, apiCalls: 120 },
    { time: '04:00', responseTime: 231, apiCalls: 89 },
    { time: '08:00', responseTime: 267, apiCalls: 156 },
    { time: '12:00', responseTime: 289, apiCalls: 201 },
    { time: '16:00', responseTime: 234, apiCalls: 167 },
    { time: '20:00', responseTime: 198, apiCalls: 134 },
  ];

  const ticketDistribution = [
    { name: 'Technical', value: 35, color: '#3b82f6' },
    { name: 'Billing', value: 25, color: '#10b981' },
    { name: 'General', value: 20, color: '#f59e0b' },
    { name: 'Integration', value: 15, color: '#8b5cf6' },
    { name: 'Escalated', value: 5, color: '#ef4444' },
  ];

  const systemPerformance = [
    { system: 'CRM API', uptime: 99.8, responseTime: 187 },
    { system: 'ERP API', uptime: 99.2, responseTime: 234 },
    { system: 'Webhook Handler', uptime: 99.9, responseTime: 145 },
    { system: 'AI Classifier', uptime: 98.7, responseTime: 312 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-slate-400">Comprehensive insights into integration performance and customer support metrics</p>
        </div>
        <div className="flex space-x-3">
          <Select defaultValue="7days">
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            className="bg-electric-blue hover:bg-blue-600"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <GlassmorphismCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">API Uptime</p>
              <p className="text-3xl font-bold text-neon-green">{successRate}%</p>
              <p className="text-xs text-neon-green">+0.2% from last week</p>
            </div>
            <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-neon-green text-xl" />
            </div>
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg Response Time</p>
              <p className="text-3xl font-bold text-electric-blue">{avgResponseTime}ms</p>
              <p className="text-xs text-red-400">+12ms from last week</p>
            </div>
            <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center">
              <Clock className="text-electric-blue text-xl" />
            </div>
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Daily Requests</p>
              <p className="text-3xl font-bold text-purple-400">{(totalApiCalls / 1000).toFixed(1)}K</p>
              <p className="text-xs text-neon-green">+8.3% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center">
              <Zap className="text-purple-400 text-xl" />
            </div>
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Error Rate</p>
              <p className="text-3xl font-bold text-yellow-400">{errorRate}%</p>
              <p className="text-xs text-neon-green">-0.1% from last week</p>
            </div>
            <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-yellow-400 text-xl" />
            </div>
          </div>
        </GlassmorphismCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* API Performance Chart */}
        <GlassmorphismCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">API Performance Trends</h3>
            <div className="flex space-x-2">
              <Button size="sm" className="bg-electric-blue/20 text-electric-blue border border-electric-blue/30">
                Response Time
              </Button>
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                Throughput
              </Button>
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                Errors
              </Button>
            </div>
          </div>

          {/* Mock Chart Area */}
          <div className="h-64 bg-slate-900/50 rounded-lg border border-slate-700 relative overflow-hidden">
            {/* Chart Background Grid */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 25px, #475569 26px), repeating-linear-gradient(90deg, transparent, transparent 50px, #475569 51px)`
            }}></div>
            
            {/* Mock Chart Line */}
            <svg className="absolute inset-0 w-full h-full">
              <polyline 
                points="20,200 80,180 140,160 200,140 260,120 320,110 380,115 440,105 500,95 560,90"
                fill="none" 
                stroke="hsl(207, 90%, 54%)" 
                strokeWidth="3" 
                opacity="0.8"
              />
              <polyline 
                points="20,220 80,200 140,185 200,170 260,155 320,145 380,150 440,140 500,130 560,125"
                fill="none" 
                stroke="hsl(142, 76%, 36%)" 
                strokeWidth="2" 
                opacity="0.6"
              />
            </svg>

            {/* Chart Labels */}
            <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-slate-500">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
            
            <div className="absolute top-2 left-2 right-2 flex justify-between text-xs text-slate-500">
              <span>500ms</span>
              <span className="text-right">100ms</span>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-electric-blue"></div>
              <span className="text-slate-400">CRM API</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-neon-green"></div>
              <span className="text-slate-400">ERP API</span>
            </div>
          </div>
        </GlassmorphismCard>

        {/* Ticket Resolution Chart */}
        <GlassmorphismCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Support Ticket Analytics</h3>
            <div className="flex space-x-2">
              <Button size="sm" className="bg-neon-green/20 text-neon-green border border-neon-green/30">
                Resolution
              </Button>
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                Volume
              </Button>
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                Satisfaction
              </Button>
            </div>
          </div>

          {/* Mock Donut Chart */}
          <div className="h-64 flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Donut Chart */}
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle cx="96" cy="96" r="80" fill="none" stroke="#374151" strokeWidth="16"/>
                {/* Auto-Resolved (60%) */}
                <circle cx="96" cy="96" r="80" fill="none" stroke="hsl(142, 76%, 36%)" strokeWidth="16"
                        strokeDasharray="301.59 502.65" strokeDashoffset="0"/>
                {/* Agent Resolved (30%) */}
                <circle cx="96" cy="96" r="80" fill="none" stroke="hsl(207, 90%, 54%)" strokeWidth="16"
                        strokeDasharray="150.8 502.65" strokeDashoffset="-301.59"/>
                {/* Escalated (10%) */}
                <circle cx="96" cy="96" r="80" fill="none" stroke="#F59E0B" strokeWidth="16"
                        strokeDasharray="50.27 502.65" strokeDashoffset="-452.39"/>
              </svg>
              
              {/* Center Label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{totalTickets}</div>
                  <div className="text-xs text-slate-400">Total Tickets</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center space-x-1 mb-1">
                <div className="w-3 h-3 bg-neon-green rounded-full"></div>
                <span className="text-xs text-slate-400">Auto-Resolved</span>
              </div>
              <div className="text-lg font-semibold text-neon-green">60%</div>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 mb-1">
                <div className="w-3 h-3 bg-electric-blue rounded-full"></div>
                <span className="text-xs text-slate-400">Agent Resolved</span>
              </div>
              <div className="text-lg font-semibold text-electric-blue">30%</div>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 mb-1">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-xs text-slate-400">Escalated</span>
              </div>
              <div className="text-lg font-semibold text-yellow-400">10%</div>
            </div>
          </div>
        </GlassmorphismCard>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-3 gap-6">
        {/* Integration Health Report */}
        <GlassmorphismCard>
          <h3 className="text-lg font-semibold text-white mb-4">Integration Health</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neon-green rounded-full status-online"></div>
                <div>
                  <div className="text-sm font-medium text-slate-200">CRM Sync</div>
                  <div className="text-xs text-slate-400">Last: 2 min ago</div>
                </div>
              </div>
              <div className="text-neon-green text-sm font-semibold">99.2%</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neon-green rounded-full status-online"></div>
                <div>
                  <div className="text-sm font-medium text-slate-200">ERP Sync</div>
                  <div className="text-xs text-slate-400">Last: 1 min ago</div>
                </div>
              </div>
              <div className="text-neon-green text-sm font-semibold">98.8%</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-slate-200">Webhook Delivery</div>
                  <div className="text-xs text-slate-400">Last: 5 min ago</div>
                </div>
              </div>
              <div className="text-yellow-400 text-sm font-semibold">97.1%</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neon-green rounded-full status-online"></div>
                <div>
                  <div className="text-sm font-medium text-slate-200">Data Validation</div>
                  <div className="text-xs text-slate-400">Continuous</div>
                </div>
              </div>
              <div className="text-neon-green text-sm font-semibold">99.9%</div>
            </div>
          </div>
        </GlassmorphismCard>

        {/* Customer Satisfaction */}
        <GlassmorphismCard>
          <h3 className="text-lg font-semibold text-white mb-4">Customer Satisfaction</h3>

          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-electric-blue">4.2</div>
            <div className="flex items-center justify-center space-x-1 mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-xs text-slate-400 mt-1">Based on 127 responses</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">5 stars</span>
                <div className="w-20 bg-slate-700 rounded-full h-1.5">
                  <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              <span className="text-xs text-slate-400">68%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">4 stars</span>
                <div className="w-20 bg-slate-700 rounded-full h-1.5">
                  <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>
              <span className="text-xs text-slate-400">22%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">3 stars</span>
                <div className="w-20 bg-slate-700 rounded-full h-1.5">
                  <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '7%' }}></div>
                </div>
              </div>
              <span className="text-xs text-slate-400">7%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">2 stars</span>
                <div className="w-20 bg-slate-700 rounded-full h-1.5">
                  <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '2%' }}></div>
                </div>
              </div>
              <span className="text-xs text-slate-400">2%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">1 star</span>
                <div className="w-20 bg-slate-700 rounded-full h-1.5">
                  <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '1%' }}></div>
                </div>
              </div>
              <span className="text-xs text-slate-400">1%</span>
            </div>
          </div>
        </GlassmorphismCard>

        {/* Performance Insights */}
        <GlassmorphismCard>
          <h3 className="text-lg font-semibold text-white mb-4">Performance Insights</h3>

          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="text-green-400 h-4 w-4" />
                <span className="text-sm font-medium text-green-300">Improvement</span>
              </div>
              <p className="text-xs text-slate-300">API response times improved by 12% after recent optimization</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="text-blue-400 h-4 w-4" />
                <span className="text-sm font-medium text-blue-300">Observation</span>
              </div>
              <p className="text-xs text-slate-300">Peak traffic occurs between 9-11 AM EST daily</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="text-yellow-400 h-4 w-4" />
                <span className="text-sm font-medium text-yellow-300">Alert</span>
              </div>
              <p className="text-xs text-slate-300">Webhook delivery rate below 98% threshold</p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="text-purple-400 h-4 w-4" />
                <span className="text-sm font-medium text-purple-300">Recommendation</span>
              </div>
              <p className="text-xs text-slate-300">Consider implementing caching for frequently accessed endpoints</p>
            </div>
          </div>
        </GlassmorphismCard>
      </div>
    </div>
  );
}
