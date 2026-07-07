import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container dark:bg-surface-dim full-width bottom border-t border-outline-variant mt-auto" data-testid="footer">
      <div className="flex flex-col md:flex-row justify-between items-center px-gutter py-margin-desktop max-w-container-max mx-auto w-full gap-6">
        <div className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
          QA Shop
        </div>
        <nav>
          <ul className="flex flex-wrap justify-center gap-6">
            <li><Link to="/support" className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-surface-variant hover:underline hover:text-primary dark:hover:text-primary-fixed transition-all duration-200">Privacy Policy</Link></li>
            <li><Link to="/support" className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-surface-variant hover:underline hover:text-primary dark:hover:text-primary-fixed transition-all duration-200">Terms of Service</Link></li>
            <li><Link to="/support" className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-surface-variant hover:underline hover:text-primary dark:hover:text-primary-fixed transition-all duration-200">Contact Support</Link></li>
            <li><Link to="/support" className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-surface-variant hover:underline hover:text-primary dark:hover:text-primary-fixed transition-all duration-200">Documentation</Link></li>
          </ul>
        </nav>
        <div className="font-body-sm text-body-sm text-on-surface dark:text-on-surface-variant">
          &copy; {new Date().getFullYear()} QA Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
