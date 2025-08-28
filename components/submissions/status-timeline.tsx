'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface StatusTimelineProps {
  submission: any;
}

export function StatusTimeline({ submission }: StatusTimelineProps) {
  const statusSteps = [
    {
      status: 'draft',
      label: 'Draft',
      timestamp: submission.submitted_at,
      icon: Clock,
      color: 'text-gray-600'
    },
    {
      status: 'edited',
      label: 'Edited',
      timestamp: submission.edited_at,
      icon: CheckCircle,
      color: 'text-blue-600'
    },
    {
      status: 'uploaded',
      label: 'Uploaded',
      timestamp: submission.uploaded_at,
      icon: CheckCircle,
      color: 'text-yellow-600'
    },
    {
      status: 'published',
      label: 'Published',
      timestamp: submission.published_at,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      status: 'rejected',
      label: 'Rejected',
      timestamp: submission.rejected_at,
      icon: AlertCircle,
      color: 'text-red-600'
    }
  ];

  const currentStatusIndex = statusSteps.findIndex(step => step.status === submission.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusSteps.map((step, index) => {
            const isActive = index <= currentStatusIndex;
            const isCurrent = step.status === submission.status;
            const isRejected = submission.status === 'rejected' && step.status === 'rejected';
            
            if (!isActive && !isRejected) return null;

            return (
              <div key={step.status} className="flex items-center space-x-3">
                <div className={`flex-shrink-0 p-1 rounded-full ${
                  isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <step.icon className={`h-4 w-4 ${
                    isCurrent ? 'text-blue-600' : step.color
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  {step.timestamp && (
                    <p className="text-xs text-gray-500">
                      {format(new Date(step.timestamp), 'PPP p')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}