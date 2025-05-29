import { useLocation } from "wouter";
import Header from "./Header";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import MobileNavigation from "./MobileNavigation";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col min-h-screen" data-component="App">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 mt-4 flex pb-20 md:pb-4">
        <Sidebar />
        
        <main className="flex-1 max-w-2xl mx-auto">
          {children}
        </main>
        
        <RightSidebar />
      </div>
      
      <MobileNavigation />
    </div>
  );
}
