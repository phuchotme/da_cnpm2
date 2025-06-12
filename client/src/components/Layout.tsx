import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, Menu, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const NavigationLinks = () => (
    <>
      <Link href="/" className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
        Home
      </Link>
      <Link href="/campaigns" className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
        Campaigns
      </Link>
      <Link href="/organizations" className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
        Organizations
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Heart className="text-primary w-8 h-8 mr-2" />
                <span className="text-xl font-bold text-neutral-900">CharityConnect</span>
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-8">
                  <NavigationLinks />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Button variant="ghost" onClick={() => setLocation('/login')}>
                    Sign In
                  </Button>
                  <Button onClick={() => setLocation('/register')}>
                    Get Started
                  </Button>
                </>
              ) : (
                <>
                  <div className="hidden md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm">{user?.firstName}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {user?.role === 'admin' && (
                          <DropdownMenuItem onClick={() => setLocation('/admin')}>
                            Admin Dashboard
                          </DropdownMenuItem>
                        )}
                        {user?.role === 'organization' && (
                          <DropdownMenuItem onClick={() => setLocation('/org-dashboard')}>
                            Organization Dashboard
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setLocation('/dashboard')}>
                          My Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation('/my-donations')}>
                          My Donations
                        </DropdownMenuItem>
                        {user?.role === 'user' && (
                          <DropdownMenuItem onClick={() => setLocation('/apply-organization')}>
                            Become Organization
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Mobile menu */}
                  <div className="md:hidden">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Menu className="w-5 h-5" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <div className="flex flex-col space-y-4 mt-6">
                          <NavigationLinks />
                          <hr />
                          <Button variant="ghost" onClick={() => setLocation('/dashboard')}>
                            My Dashboard
                          </Button>
                          <Button variant="ghost" onClick={handleLogout} className="text-red-600">
                            Sign Out
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Heart className="text-primary w-8 h-8 mr-2" />
                <span className="text-xl font-bold">CharityConnect</span>
              </div>
              <p className="text-neutral-400 mb-4">
                Connecting hearts and causes through transparent, verified charitable giving.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Donors</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="/campaigns" className="hover:text-white transition-colors">Browse Campaigns</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/my-donations" className="hover:text-white transition-colors">Donation History</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Organizations</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="/apply-organization" className="hover:text-white transition-colors">Apply to Join</Link></li>
                <li><Link href="/create-campaign" className="hover:text-white transition-colors">Create Campaign</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 CharityConnect. All rights reserved. Built with transparency and trust in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
