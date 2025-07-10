import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Terminal, RefreshCw, Trash2, Download, Filter, Search } from 'lucide-react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { IntegrationLog } from '@shared/schema';

export default function Logs() {
  const [logLevel, setLogLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const { data: logs = [], refetch } = useQuery<IntegrationLog[]>({
    queryKey: ['/api/logs', { limit: 1000 }],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Filter logs based on level and search query
  const filteredLogs = logs.filter(log => {
    const matchesLevel = logLevel === 'all' || log.status === logLevel;
    const matchesSearch = !searchQuery || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.system.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLevel && matchesSearch;
  });

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const getLogColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-neon-green';
      case 'info': return 'text-electric-blue';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-300';
    }
  };

  const getLogIcon = (status: string) => {
    switch (status) {
      case 'success': return '✓';
      case 'info': return 'ℹ';
      case 'warning': return '⚠';
      case 'error': return '✗';
      default: return '•';
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const handleClearLogs = () => {
    // In a real app, this would call an API to clear logs
    console.log('Clear logs requested');
  };

  const handleExportLogs = () => {
    const logData = filteredLogs.map(log => ({
      timestamp: formatTimestamp(log.timestamp),
      level: log.status.toUpperCase(),
      system: log.system.toUpperCase(),
      action: log.action,
      message: log.message
    }));

    const csvContent = [
      'Timestamp,Level,System,Action,Message',
      ...logData.map(log => 
        `"${log.timestamp}","${log.level}","${log.system}","${log.action}","${log.message}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">System Logs</h2>
          <p className="text-slate-400">Real-time integration logs and system events</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-neon-green rounded-full status-online"></div>
            <span className="text-sm text-slate-300">Live</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <GlassmorphismCard className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <Select value={logLevel} onValueChange={setLogLevel}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="pl-10 w-64 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-slate-300">Auto-scroll</label>
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded bg-slate-700 border-slate-600"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button size="sm" onClick={() => refetch()} className="bg-electric-blue hover:bg-blue-600">
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportLogs}>
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" variant="outline" onClick={handleClearLogs}>
              <Trash2 className="mr-1 h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>Showing {filteredLogs.length} of {logs.length} log entries</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-neon-green rounded-full"></div>
              <span>Success</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-electric-blue rounded-full"></div>
              <span>Info</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Warning</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Error</span>
            </div>
          </div>
        </div>
      </GlassmorphismCard>

      {/* Terminal-style Log Display */}
      <div className="flex-1 min-h-0">
        <GlassmorphismCard className="h-full flex flex-col">
          <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-700">
            <Terminal className="h-4 w-4 text-electric-blue" />
            <span className="text-sm font-medium text-white">Integration Logs</span>
            <div className="flex-1"></div>
            <div className="text-xs text-slate-400">
              Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div 
            ref={logContainerRef}
            className="flex-1 bg-black/50 rounded-lg p-4 terminal-font text-sm overflow-y-auto"
          >
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Terminal className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No logs match your current filters</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredLogs.map((log, index) => (
                  <div key={`${log.id}-${index}`} className="flex space-x-3 hover:bg-slate-800/30 px-2 py-1 rounded">
                    <span className="text-slate-400 min-w-0 flex-shrink-0">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    <span className={`min-w-0 flex-shrink-0 ${getLogColor(log.status)} font-medium`}>
                      [{log.status.toUpperCase()}]
                    </span>
                    <span className="text-slate-500 min-w-0 flex-shrink-0">
                      {log.system.toUpperCase()}:
                    </span>
                    <span className="text-slate-300 flex-1 min-w-0 break-words">
                      {log.message}
                    </span>
                    <span className={`${getLogColor(log.status)} min-w-0 flex-shrink-0`}>
                      {getLogIcon(log.status)}
                    </span>
                  </div>
                ))}
                
                {/* Live cursor */}
                {logs.length > 0 && (
                  <div className="flex space-x-3 mt-2">
                    <span className="text-slate-400">{formatTimestamp(new Date())}</span>
                    <span className="text-neon-green status-online">█</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </GlassmorphismCard>
      </div>

      {/* Stats Footer */}
      <div className="mt-4 grid grid-cols-4 gap-4">
        <GlassmorphismCard className="text-center py-2">
          <div className="text-lg font-bold text-neon-green">
            {logs.filter(l => l.status === 'success').length}
          </div>
          <div className="text-xs text-slate-400">Success</div>
        </GlassmorphismCard>

        <GlassmorphismCard className="text-center py-2">
          <div className="text-lg font-bold text-electric-blue">
            {logs.filter(l => l.status === 'info').length}
          </div>
          <div className="text-xs text-slate-400">Info</div>
        </GlassmorphismCard>

        <GlassmorphismCard className="text-center py-2">
          <div className="text-lg font-bold text-yellow-400">
            {logs.filter(l => l.status === 'warning').length}
          </div>
          <div className="text-xs text-slate-400">Warning</div>
        </GlassmorphismCard>

        <GlassmorphismCard className="text-center py-2">
          <div className="text-lg font-bold text-red-400">
            {logs.filter(l => l.status === 'error').length}
          </div>
          <div className="text-xs text-slate-400">Error</div>
        </GlassmorphismCard>
      </div>
    </div>
  );
}
