export function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="container mx-auto max-w-7xl py-6">
      <div className="flex justify-center items-center h-40">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}