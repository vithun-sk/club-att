import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';
import type { ActivePage } from '../../types';

interface ShellProps {
  currentPage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ currentPage, onNavigate, children }) => {
  return (
    <div className="app-shell">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="app-main-content">
        <Navbar onNavigate={onNavigate} />
        <main className="app-page-body">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
