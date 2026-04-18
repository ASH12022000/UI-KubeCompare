import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ComparisonService {
  constructor(private http: HttpClient) {}

  testConnection(env: any) {
    return this.http.post('/api/comparison/connect', env);
  }

  runComparison(request: any) {
    return this.http.post('/api/comparison/run', request);
  }
}
<!-- slide -->
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComparisonService } from '../services/comparison.service';

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8">
      <div class="flex mb-8 glass">
        <div class="stepper-item" [class.active]="step === 1">1. Credentials</div>
        <div class="stepper-item" [class.active]="step === 2">2. Scope</div>
        <div class="stepper-item" [class.active]="step === 3">3. Selection</div>
        <div class="stepper-item" [class.active]="step === 4">4. Results</div>
      </div>

      <div [ngSwitch]="step">
        <div *ngSwitchCase="1" class="glass p-6">
          <h3 class="text-xl mb-4">Cluster Connection</h3>
          <div class="grid grid-cols-2 gap-8">
            <div>
              <h4 class="mb-2 text-primary">Cluster A</h4>
              <select [(ngModel)]="env1.type" class="input-field">
                <option value="DIRECT">Direct API</option>
                <option value="JUMP">Jump Server</option>
              </select>
              <input type="text" [(ngModel)]="env1.clusterUrl" placeholder="API Endpoint" class="input-field">
              <input type="password" [(ngModel)]="env1.encryptedToken" placeholder="Token" class="input-field">
            </div>
            <div>
              <h4 class="mb-2 text-primary">Cluster B</h4>
              <select [(ngModel)]="env2.type" class="input-field">
                <option value="DIRECT">Direct API</option>
                <option value="JUMP">Jump Server</option>
              </select>
              <input type="text" [(ngModel)]="env2.clusterUrl" placeholder="API Endpoint" class="input-field">
              <input type="password" [(ngModel)]="env2.encryptedToken" placeholder="Token" class="input-field">
            </div>
          </div>
          <button (click)="nextStep()" class="btn-primary float-right">Next</button>
        </div>

        <div *ngSwitchCase="2" class="glass p-6">
          <h3 class="text-xl mb-4">Namespace & Filter</h3>
          <div class="grid grid-cols-2 gap-4">
             <input type="text" [(ngModel)]="ns1" placeholder="Namespace Cluster A" class="input-field">
             <input type="text" [(ngModel)]="ns2" placeholder="Namespace Cluster B" class="input-field">
          </div>
          <button (click)="prevStep()" class="btn-primary">Back</button>
          <button (click)="nextStep()" class="btn-primary float-right">Next</button>
        </div>

        <div *ngSwitchCase="3" class="glass p-6">
          <h3 class="text-xl mb-4">Select Checks</h3>
          <div class="grid grid-cols-2 gap-4">
             <div *ngFor="let check of availableChecks">
               <label class="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" [checked]="checks.includes(check)" (change)="toggleCheck(check)">
                 {{check}}
               </label>
             </div>
          </div>
          <button (click)="prevStep()" class="btn-primary">Back</button>
          <button (click)="startComparison()" class="btn-primary float-right">Run Comparison</button>
        </div>

        <div *ngSwitchCase="4" class="glass p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl">Comparison Results</h3>
            <div class="flex gap-2">
              <button (click)="saveAsBaseline()" class="btn-primary text-xs bg-secondary">Save Baseline</button>
              <button (click)="exportReport()" class="btn-primary text-xs">Export PDF</button>
            </div>
          </div>

          <div *ngIf="loading" class="text-center py-10">
             <div class="animate-pulse text-primary text-lg">Comparing Clusters...</div>
          </div>

          <div *ngIf="!loading">
            <!-- Filter Bar -->
            <div class="flex gap-4 mb-6">
               <input type="text" [(ngModel)]="searchTerm" placeholder="Search resources..." class="input-field mb-0 flex-1">
               <select [(ngModel)]="filterStatus" class="input-field mb-0 w-48">
                  <option value="ALL">Show All</option>
                  <option value="MATCH">Matches Only</option>
                  <option value="DIFFERENT">Differences Only</option>
               </select>
            </div>

            <!-- Summary Dashboard -->
            <div class="grid grid-cols-3 gap-4 mb-6">
               <div class="glass p-4 text-center border-b-4 border-secondary">
                  <span class="text-secondary text-2xl font-bold">{{matchCount}}</span>
                  <div class="text-muted text-sm">Matches</div>
               </div>
               <div class="glass p-4 text-center border-b-4 border-warning">
                  <span class="text-warning text-2xl font-bold">{{diffCount}}</span>
                  <div class="text-muted text-sm">Differences</div>
               </div>
               <div class="glass p-4 text-center border-b-4 border-missing">
                  <span class="text-missing text-2xl font-bold">{{missingCount}}</span>
                  <div class="text-muted text-sm">Missing</div>
               </div>
            </div>
            
            <div *ngFor="let cat of filteredResults | keyvalue">
               <h4 class="mt-6 mb-2 text-primary uppercase text-sm font-bold flex justify-between">
                 <span>{{cat.key}}</span>
                 <span class="text-muted text-xs">{{(cat.value).length}} items</span>
               </h4>
               <table class="diff-table glass">
                 <thead>
                   <tr><th>Name</th><th>Status</th><th class="text-right">Action</th></tr>
                 </thead>
                 <tbody>
                   <tr *ngFor="let item of cat.value">
                     <td>{{item.name}}</td>
                     <td>
                        <span [ngClass]="item.status.toLowerCase()" class="px-2 py-1 rounded text-xs font-bold bg-white/5">
                           {{item.status}}
                        </span>
                     </td>
                     <td class="text-right"><button class="btn-primary text-xs py-1 px-3">View Details</button></td>
                   </tr>
                 </tbody>
               </table>
            </div>
          </div>
          <button (click)="step = 3" class="btn-primary mt-6">Back to Settings</button>
        </div>
      </div>
    </div>
  `
})
export class WizardComponent {
  step = 1;
  env1 = { type: 'DIRECT', clusterUrl: '', encryptedToken: '' };
  env2 = { type: 'DIRECT', clusterUrl: '', encryptedToken: '' };
  ns1 = 'default';
  ns2 = 'default';
  checks: string[] = ['DEPLOYMENTS', 'CONFIGMAPS', 'IMAGES'];
  availableChecks = ['DEPLOYMENTS', 'CONFIGMAPS', 'IMAGES', 'PVC', 'SERVICES', 'VIRTUALSERVICES', 'AUTH_POLICY'];
  results: any = {};
  loading = false;
  
  searchTerm = '';
  filterStatus = 'ALL';

  constructor(private comp: ComparisonService) {}

  nextStep() { if (this.step < 4) this.step++; }
  prevStep() { if (this.step > 1) this.step--; }

  toggleCheck(check: string) {
    const idx = this.checks.indexOf(check);
    if (idx > -1) this.checks.splice(idx, 1);
    else this.checks.push(check);
  }

  get filteredResults() {
    const filtered: any = {};
    Object.keys(this.results).forEach(key => {
      const items = this.results[key].filter((item: any) => {
        const matchesSearch = item.name.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesFilter = this.filterStatus === 'ALL' || item.status === this.filterStatus;
        return matchesSearch && matchesFilter;
      });
      if (items.length > 0) filtered[key] = items;
    });
    return filtered;
  }

  startComparison() {
    this.step = 4;
    this.loading = true;
    this.comp.runComparison({
      env1: this.env1, env2: this.env2, ns1: this.ns1, ns2: this.ns2, checks: this.checks
    }).subscribe({
      next: (res: any) => {
        this.results = res;
        this.loading = false;
        this.calculateCounts();
      },
      error: () => this.loading = false
    });
  }

  calculateCounts() {
    this.matchCount = 0;
    this.diffCount = 0;
    this.missingCount = 0;
    Object.values(this.results).forEach((items: any) => {
      items.forEach((item: any) => {
        if (item.status === 'MATCH') this.matchCount++;
        else if (item.status === 'DIFFERENT') this.diffCount++;
        else this.missingCount++;
      });
    });
  }

  exportReport() {
    alert('Generating PDF report...');
    // Real call: this.comp.exportPdf(this.results).subscribe(...)
  }

  saveAsBaseline() {
    alert('Environment saved as Baseline.');
  }
}
