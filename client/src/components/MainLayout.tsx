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
      
      <div className="flex-grow container mx-auto px-4 mt-4 flex">
        <Sidebar />
        
        <main className="flex-1 max-w-2xl mx-auto">
          {children}
        </main>
        
        <RightSidebar />
      </div>
      
      <MobileNavigation />
      
      {/* Floating New Post Button (Mobile) */}
      <div className="md:hidden fixed right-6 bottom-20">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-primary hover:bg-primary-dark text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        >
          <i className="fas fa-plus text-xl"></i>
        </button>
      </div>
    </div>
  );
}
