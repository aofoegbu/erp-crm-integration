import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const scheduleMaintenanceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  system: z.enum(["crm", "erp", "integration", "database", "api"]),
  scheduledStart: z.string().min(1, "Start time is required"),
  scheduledEnd: z.string().min(1, "End time is required"),
  estimatedDowntime: z.number().min(0, "Downtime must be positive").max(1440, "Maximum 24 hours"),
  approvedBy: z.string().min(1, "Approval required")
}).refine(data => new Date(data.scheduledEnd) > new Date(data.scheduledStart), {
  message: "End time must be after start time",
  path: ["scheduledEnd"]
});

type FormData = z.infer<typeof scheduleMaintenanceSchema>;

interface ScheduleMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleMaintenanceModal({ isOpen, onClose }: ScheduleMaintenanceModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate default start time (next hour)
  const now = new Date();
  const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0);
  const defaultStart = nextHour.toISOString().slice(0, 16);
  const defaultEnd = new Date(nextHour.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);

  const form = useForm<FormData>({
    resolver: zodResolver(scheduleMaintenanceSchema),
    defaultValues: {
      title: '',
      description: '',
      system: 'integration',
      scheduledStart: defaultStart,
      scheduledEnd: defaultEnd,
      estimatedDowntime: 30,
      approvedBy: 'Admin User'
    }
  });

  const scheduleMaintenanceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const maintenanceData = {
        ...data,
        scheduledStart: data.scheduledStart,
        scheduledEnd: data.scheduledEnd,
        status: 'scheduled'
      };
      
      return apiRequest('POST', '/api/maintenance', maintenanceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/dashboard'] });
      toast({
        title: "Maintenance Scheduled",
        description: "Maintenance window has been scheduled successfully"
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule maintenance. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FormData) => {
    scheduleMaintenanceMutation.mutate(data);
  };

  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-electric-blue" />
            <h2 className="text-xl font-bold text-white">Schedule Maintenance</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Maintenance Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., CRM Database Optimization"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="system"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">System</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select system" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="crm">CRM System</SelectItem>
                      <SelectItem value="erp">ERP System</SelectItem>
                      <SelectItem value="integration">Integration Platform</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="api">API Gateway</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the maintenance work to be performed..."
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Start Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="datetime-local"
                        min={defaultStart}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      End Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="datetime-local"
                        min={defaultStart}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estimatedDowntime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Estimated Downtime (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      max="1440"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="approvedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Approved By</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Approver name"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={scheduleMaintenanceMutation.isPending}
                className="bg-electric-blue hover:bg-blue-600"
              >
                {scheduleMaintenanceMutation.isPending ? 'Scheduling...' : 'Schedule Maintenance'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}