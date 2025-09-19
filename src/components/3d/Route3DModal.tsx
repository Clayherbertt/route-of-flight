import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";

interface Route3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: {
    id: string;
    title: string;
    category: string;
    completed: boolean;
    taskProgress: Record<string, boolean>;
  } | null;
  fullStep?: any;
  onTaskToggle: (stepId: string, taskId: string, checked: boolean) => void;
}

export function Route3DModal({ 
  isOpen, 
  onClose, 
  step, 
  fullStep,
  onTaskToggle 
}: Route3DModalProps) {
  if (!step || !fullStep) return null;

  // Calculate progress
  const completedTasks = fullStep.details.filter((detail: any) => 
    step.taskProgress[detail.id || detail.title] || false
  ).length;
  const progress = fullStep.details.length > 0 ? (completedTasks / fullStep.details.length) * 100 : 0;

  const formatHtmlContent = (html: string) => {
    if (!html || !html.trim()) return null;
    
    const processedHtml = html
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '<span class="font-bold">$1</span>')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '<span class="font-bold">$1</span>')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '<span class="underline font-semibold">$1</span>')
      .replace(/<p[^>]*>/gi, '<div class="mb-4 leading-relaxed">')
      .replace(/<\/p>/gi, '</div>')
      .replace(/<br\s*\/?>/gi, '<br />')
      .replace(/&nbsp;/g, ' ');
    
    return (
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                {step.title}
              </DialogTitle>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline">{step.category}</Badge>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="w-32" />
                  <span className="text-sm text-muted-foreground">
                    {completedTasks}/{fullStep.details.length} complete
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Description */}
          {fullStep.description && fullStep.description.trim() && (
            <div>
              <h3 className="font-semibold mb-3 text-lg">Overview</h3>
              <div className="bg-muted/30 rounded-lg p-4">
                {formatHtmlContent(fullStep.description)}
              </div>
            </div>
          )}

          {/* Task Details */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">
              Tasks & Requirements ({fullStep.details.length})
            </h3>
            <div className="space-y-4">
              {fullStep.details.map((detail: any, detailIndex: number) => {
                const isCompleted = step.taskProgress[detail.id || detail.title] || false;
                
                return (
                  <div 
                    key={detail.id || detailIndex} 
                    className={`border rounded-lg p-4 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/20' 
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={`task-${detail.id || detailIndex}`}
                        checked={isCompleted}
                        onCheckedChange={(checked) => 
                          onTaskToggle(step.id, detail.id || detail.title, !!checked)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <label 
                            htmlFor={`task-${detail.id || detailIndex}`}
                            className={`font-semibold cursor-pointer transition-all duration-300 ${
                              isCompleted 
                                ? 'line-through text-muted-foreground' 
                                : 'text-foreground'
                            }`}
                          >
                            {detail.title}
                          </label>
                          <div className="flex gap-2 flex-shrink-0">
                            {detail.flightHours && (
                              <Badge variant="outline" className="text-xs">
                                {detail.flightHours}h
                              </Badge>
                            )}
                            {step.category !== 'Initial Tasks' && (
                              <Badge 
                                variant={detail.taskType === 'flight' ? 'default' : 'secondary'} 
                                className="text-xs"
                              >
                                {detail.taskType || 'ground'}
                              </Badge>
                            )}
                            {detail.mandatory && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                            {isCompleted && (
                              <Badge variant="default" className="text-xs bg-green-500">
                                ✓ Complete
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Task Description */}
                        {detail.description && detail.description.trim() && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {formatHtmlContent(detail.description)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}