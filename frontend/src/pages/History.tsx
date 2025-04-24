import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { standup, StandupEntry } from "@/lib/api";
import { Loading } from "@/components/Loading";
import { ErrorCard } from "@/components/ErrorCard";
import { PageWrapper } from "@/components/PageWrapper";

export function HistoryPage() {
  const [filter, setFilter] = useState<"all" | "week" | "month">("all");
  const [standupEntries, setStandupEntries] = useState<StandupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's standup history using API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Pass the filter to the API to get server-filtered results
        const response = await standup.getAll(filter);
        setStandupEntries(response || []);
        setError(null);
      } catch (err: unknown) {
        console.error('Failed to fetch standup history:', err);
        setError('Failed to load your standup history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [filter]); // Re-fetch when filter changes
  
  // Format entries for display
  const displayEntries = standupEntries
    .map(entry => ({
      id: entry._id,
      date: new Date(entry.createdAt).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      yesterday: entry.yesterday,
      today: entry.today,
      blockers: entry.blockers
    }));

  // Filter controls component
  const filterControls = !loading && !error && (
    <div className="w-full sm:w-48">
      <Select 
        value={filter} 
        onValueChange={(value) => setFilter(value as "all" | "week" | "month")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <PageWrapper 
      title="My Standup History"
      filterSection={filterControls}
    >
      {loading ? (
        <Loading message="Loading your standup history..." />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] py-4">Date</TableHead>
                <TableHead className="py-4">Yesterday</TableHead>
                <TableHead className="py-4">Today</TableHead>
                <TableHead className="py-4">Blockers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium py-4 px-6">{entry.date}</TableCell>
                  <TableCell className="py-4 px-6">{entry.yesterday}</TableCell>
                  <TableCell className="py-4 px-6">{entry.today}</TableCell>
                  <TableCell className="py-4 px-6">{entry.blockers}</TableCell>
                </TableRow>
              ))}
              {displayEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No standup entries found for this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </PageWrapper>
  );
}
