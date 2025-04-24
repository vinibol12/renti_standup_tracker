import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/api";

export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      setValidationErrors({});
      
      // Call the register API with username and email
      const user = await auth.register(username, email);
      
      console.log("Registration successful:", user);
      
      // Store user info in localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));
      
      // Navigate to the daily page
      navigate("/daily");
    } catch (err: unknown) {
      console.error("Registration failed:", err);
      
      // Handle validation errors
      if (err && typeof err === 'object' && 'validationErrors' in err) {
        // Display field-specific validation errors
        console.log('Validation errors from backend:', err.validationErrors);
        setValidationErrors(err.validationErrors as Record<string, string>);
        setError("Please fix the errors below.");
      } else {
        // Generic error message
        setError("Registration failed. Please try a different username.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">Create Account</CardTitle>
          <CardDescription className="text-center">Join your team and start tracking standups</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
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
                placeholder="johndoe" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className={validationErrors.username ? "border-destructive" : ""}
              />
              {validationErrors.username && (
                <p className="text-destructive text-sm">{validationErrors.username}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isLoading}
                className={validationErrors.email ? "border-destructive" : ""}
              />
              {validationErrors.email && (
                <p className="text-destructive text-sm">{validationErrors.email}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
