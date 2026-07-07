import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-margin-desktop md:py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
