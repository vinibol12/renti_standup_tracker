import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { StandupEntry } from "@/lib/api";
import { PencilIcon } from "@heroicons/react/20/solid";
import { format } from "date-fns";

interface StandupViewProps {
  standup: StandupEntry;
  onEdit: () => void;
}

export function StandupView({ standup, onEdit }: StandupViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardDescription>
              You've submitted your standup for today ({format(new Date(standup.createdAt), 'MMMM d, yyyy')})
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Yesterday</h3>
          <div className="p-3 bg-muted rounded-md text-sm">
            {standup.yesterday}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Today</h3>
          <div className="p-3 bg-muted rounded-md text-sm">
            {standup.today}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Blockers</h3>
          <div className="p-3 bg-muted rounded-md text-sm">
            {standup.blockers || "No blockers reported"}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground text-center mt-4">
          You'll be able to submit your next standup tomorrow.
        </p>
      </CardContent>
    </Card>
  );
}
