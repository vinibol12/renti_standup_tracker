import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/api";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      setValidationErrors({});
      
      console.log("Attempting login with username:", username);
      
      // Call the login API with just the username
      const user = await auth.login(username);
      
      console.log("Login successful:", user);
      
      // Store user info in localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));
      
      // Navigate to the daily page
      navigate("/daily");
    } catch (err: unknown) {
      console.error("Login failed:", err);
      
      // Check if we have validation errors using type checking
      if (err && typeof err === 'object' && 'validationErrors' in err) {
        // Display field-specific validation errors
        console.log('Validation errors from backend:', err.validationErrors);
        setValidationErrors(err.validationErrors as Record<string, string>);
        setError("Please fix the errors below.");
      } else {
        // Generic error message
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">Welcome to Checkpoint</CardTitle>
          <CardDescription className="text-center">Track your team's daily standups with ease</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="Enter your username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className={validationErrors.username ? "border-destructive" : ""}
              />
              {validationErrors.username && (
                <p className="text-destructive text-sm">{validationErrors.username}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account? <a href="/register" className="text-primary font-semibold hover:underline">Sign up</a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
