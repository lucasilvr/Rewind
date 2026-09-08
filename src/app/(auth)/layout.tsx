interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      
    
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 bg-zinc-950 overflow-hidden relative">
        <div className="grid grid-cols-4 gap-2 p-4 h-full opacity-80 mix-blend-lighten">
          {Array.from({ length: 16 }).map((_, i) => (
            <div 
              key={i} 
              className="aspect-square bg-zinc-800 rounded-sm animate-pulse"
             
            />
          ))}
        </div>
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] pointer-events-none" />
      </div>

    </div>
  );
}