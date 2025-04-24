import { Button } from "@/components/ui/button";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

export function MainLayout() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // In a real app, we would invalidate the session/token here
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/daily" className="text-2xl font-bold text-primary">
            Checkpoint
          </Link>
        </div>
      </header>
      
      <nav className="bg-card shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center overflow-x-auto">
            <NavLink 
              to="/daily" 
              className={({ isActive }) => 
                `px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                  isActive 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Daily Update
            </NavLink>
            <NavLink 
              to="/team" 
              className={({ isActive }) => 
                `px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                  isActive 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Team View
            </NavLink>
            <NavLink 
              to="/history" 
              className={({ isActive }) => 
                `px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                  isActive 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              History
            </NavLink>
            <div className="ml-auto">
              <Button variant="ghost" onClick={handleLogout} className="text-primary">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
