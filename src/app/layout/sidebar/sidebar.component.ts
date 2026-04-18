import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, History, Database, Settings, LogOut, Zap } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  readonly icons: { [key: string]: any } = { LayoutDashboard, History, Database, Settings, LogOut, Zap };

  navItems = [
    { label: 'New Comparison', icon: 'Zap', path: '/wizard' },
    { label: 'History', icon: 'History', path: '/history' },
    { label: 'Golden Baselines', icon: 'Database', path: '/baselines' },
    { label: 'Settings', icon: 'Settings', path: '/settings' }
  ];

  onLogout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
