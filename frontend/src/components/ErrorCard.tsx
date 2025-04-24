import { Card } from "@/components/ui/card";

interface ErrorCardProps {
  message: string;
}

export function ErrorCard({ message }: ErrorCardProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-center items-center h-40">
        <p className="text-lg text-destructive">{message}</p>
      </div>
    </Card>
  );
}
