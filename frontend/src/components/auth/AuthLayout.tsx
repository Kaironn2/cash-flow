import React from "react";
import { BrandingPanel } from "./BrandingPanel";

interface AuthLayoutProps {
  form: React.ReactNode;
}

export function AuthLayout({ form }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      
      <div className="w-11/12 max-w-7xl min-h-[720px] rounded-2xl bg-black shadow-2xl md:grid md:grid-cols-2">
        
        <BrandingPanel />

        <div className="flex flex-col justify-center p-8 md:p-12">
          {form}
        </div>
        
      </div>
    </main>
  );
}