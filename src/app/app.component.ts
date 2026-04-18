import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen w-screen overflow-hidden">
      <!-- Sidebar -->
      <aside *ngIf="isLoggedIn" class="w-64 glass border-r border-border p-6 flex flex-col">
        <h1 class="text-2xl font-black text-primary mb-10 italic">K8s DIFF</h1>
        
        <nav class="flex-1 space-y-4">
          <a routerLink="/wizard" class="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg cursor-pointer">
            <span>🚀</span> New Comparison
          </a>
          <div class="text-xs text-muted font-bold uppercase mt-8 mb-2">Saved Env</div>
          <div *ngFor="let env of savedEnvs" class="flex items-center justify-between group p-2 hover:bg-slate-800 rounded">
            <span>🌐 {{env.name}}</span>
            <button class="opacity-0 group-hover:opacity-100 text-missing text-xs">Delete</button>
          </div>
          
          <div class="text-xs text-muted font-bold uppercase mt-8 mb-2">History (Last 10)</div>
          <div *ngFor="let run of history" class="text-sm p-2 hover:bg-slate-800 rounded cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis">
            🕒 {{run.timestamp}}
          </div>
        </nav>

        <div class="pt-8 border-t border-border mt-auto">
          <button (click)="logout()" class="text-muted hover:text-white flex items-center gap-2">
            Logout <span>🚪</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto bg-dark">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  isLoggedIn = false;
  savedEnvs: any[] = [{name: 'Staging'}, {name: 'Production'}];
  history: any[] = [{timestamp: '2026-04-18 15:30'}, {timestamp: '2026-04-17 12:45'}];

  constructor(private auth: AuthService, private router: Router) {
    this.auth.token$.subscribe(token => {
      this.isLoggedIn = !!token;
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
