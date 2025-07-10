import { Link, useLocation } from "wouter";
import { 
  Network, 
  BarChart3, 
  Plug, 
  Ticket, 
  MessageCircle, 
  TrendingUp, 
  Terminal,
  Bell,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationSystem } from "../ui/notification-system";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/integrations", label: "Integrations", icon: Plug },
    { path: "/tickets", label: "Tickets", icon: Ticket },
    { path: "/chat", label: "Live Chat", icon: MessageCircle },
    { path: "/analytics", label: "Analytics", icon: TrendingUp },
    { path: "/logs", label: "System Logs", icon: Terminal },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="glass-effect border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Network className="text-electric-blue text-xl" />
              <h1 className="text-xl font-bold text-white">Ogelo ERP-CRM Integrator</h1>
            </div>
            <div className="flex items-center space-x-1 ml-8">
              <div className="w-2 h-2 rounded-full bg-neon-green status-online"></div>
              <span className="text-sm text-slate-300">Systems Online</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-sm text-slate-400">
              <span className="mr-2">🕐</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <NotificationSystem />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-electric-blue to-neon-green rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-slate-300">Admin User</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="glass-effect border-b border-slate-700/50 px-6">
        <div className="flex space-x-8">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} href={path}>
              <Button
                variant="ghost"
                className={`nav-tab ${location === path ? 'active' : ''}`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
