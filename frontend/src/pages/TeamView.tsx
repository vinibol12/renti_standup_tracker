import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { standup, TeamStandupEntry } from "@/lib/api";
import { Loading } from "@/components/Loading";
import { ErrorCard } from "@/components/ErrorCard";
import { PageWrapper } from "@/components/PageWrapper";

export function TeamViewPage() {
  const [filter, setFilter] = useState<"today" | "yesterday" | "week">("week");
  const [teamStandups, setTeamStandups] = useState<TeamStandupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch team standups data using our API client
  useEffect(() => {
    const fetchTeamStandups = async () => {
      try {
        setLoading(true);
        const response = await standup.getTeam(filter);
        
        // Direct REST API response
        setTeamStandups(response || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch team standups:', err);
        setError('Failed to load team standups. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamStandups();
    
    // Set up a refresh interval (every minute)
    const intervalId = setInterval(() => fetchTeamStandups(), 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [filter]); // Re-fetch when filter changes

  // Process standups data for display
  const displayStandups = teamStandups.map((standup) => ({
    id: standup._id,
    name: standup.userId.username,
    email: standup.userId.email,
    yesterday: standup.yesterday,
    today: standup.today,
    blockers: standup.blockers,
    date: new Date(standup.createdAt).toLocaleDateString()
  }));

  // Filter controls component
  const filterControls = !loading && !error && (
    <div className="w-full sm:w-48">
      <Select 
        value={filter} 
        onValueChange={(value) => setFilter(value as "today" | "yesterday" | "week")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <PageWrapper 
      title="Team Standups"
      filterSection={filterControls}
    >
      {loading ? (
        <Loading message="Loading team standups..." />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] py-4">Team Member</TableHead>
                <TableHead className="w-[100px] py-4">Date</TableHead> 
                <TableHead className="py-4">Yesterday</TableHead>
                <TableHead className="py-4">Today</TableHead>
                <TableHead className="py-4">Blockers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayStandups.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span>{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">{member.date}</TableCell>
                  <TableCell className="py-4 px-6">{member.yesterday}</TableCell>
                  <TableCell className="py-4 px-6">{member.today}</TableCell>
                  <TableCell className="py-4 px-6">{member.blockers}</TableCell>
                </TableRow>
              ))}
              {displayStandups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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
