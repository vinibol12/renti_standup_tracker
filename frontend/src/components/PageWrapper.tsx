import { ReactNode } from "react";

interface PageWrapperProps {
  title: string;
  children: ReactNode;
  maxWidth?: "4xl" | "7xl"; // Default to 7xl if not specified
  filterSection?: ReactNode; // Optional filter controls
}

export function PageWrapper({ 
  title, 
  children, 
  maxWidth = "7xl", 
  filterSection 
}: PageWrapperProps) {
  return (
    <div className={`container mx-auto max-w-${maxWidth} py-6`}>
      <div className="mb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-primary">{title}</h1>
          {filterSection}
        </div>
      </div>
      
      {children}
    </div>
  );
}
