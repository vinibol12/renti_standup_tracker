import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

interface StandupFormProps {
  onSubmit: (yesterday: string, today: string, blockers: string) => Promise<void>;
  validationErrors?: Record<string, string>;
  error?: string | null;
  isSubmitting?: boolean;
  initialValues?: {
    yesterday: string;
    today: string;
    blockers: string;
  };
  isEditing?: boolean;
  onCancel?: () => void;
}

export function StandupForm({ 
  onSubmit, 
  validationErrors = {}, 
  error = null, 
  isSubmitting = false,
  initialValues,
  isEditing = false,
  onCancel
}: StandupFormProps) {
  const [yesterday, setYesterday] = useState(initialValues?.yesterday || "");
  const [today, setToday] = useState(initialValues?.today || "");
  const [blockers, setBlockers] = useState(initialValues?.blockers || "");

  // Update form state if initialValues change (e.g., when switching to edit mode)
  useEffect(() => {
    if (initialValues) {
      setYesterday(initialValues.yesterday);
      setToday(initialValues.today);
      setBlockers(initialValues.blockers || "");
    }
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(yesterday, today, blockers);
  };

  const handleCancel = () => {
    // Reset form fields to initial values
    if (initialValues) {
      setYesterday(initialValues.yesterday);
      setToday(initialValues.today);
      setBlockers(initialValues.blockers || "");
    }
    
    // Call the onCancel callback if provided
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardDescription>
          {isEditing 
            ? "Update your standup entry for today" 
            : "Share your progress and plans with the team"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="yesterday">Yesterday</Label>
            <Textarea 
              id="yesterday" 
              placeholder="What did you accomplish yesterday?"
              value={yesterday}
              onChange={(e) => setYesterday(e.target.value)}
              className={validationErrors.yesterday ? "border-destructive" : ""}
            />
            {validationErrors.yesterday && (
              <p className="text-destructive text-sm">{validationErrors.yesterday}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="today">Today</Label>
            <Textarea 
              id="today" 
              placeholder="What are you planning to do today?"
              value={today}
              onChange={(e) => setToday(e.target.value)}
              className={validationErrors.today ? "border-destructive" : ""}
            />
            {validationErrors.today && (
              <p className="text-destructive text-sm">{validationErrors.today}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="blockers">Blockers</Label>
            <Textarea 
              id="blockers" 
              placeholder="Any blockers or challenges? (optional)"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              className={validationErrors.blockers ? "border-destructive" : ""}
            />
            {validationErrors.blockers && (
              <p className="text-destructive text-sm">{validationErrors.blockers}</p>
            )}
          </div>
          
          <div className="flex gap-2 justify-end">
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? "Saving..." 
                : isEditing 
                  ? "Update" 
                  : "Submit"
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
