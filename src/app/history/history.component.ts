import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, History, Download, Trash2, Loader2, Database, Clock } from 'lucide-angular';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './history.component.html'
})
export class HistoryComponent implements OnInit {
  isLoading = true;
  historyRecords: any[] = [];
  readonly icons = { History, Download, Trash2, Loader2, Database, Clock };

  constructor(
    private api:    ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit() { this.fetchHistory(); }

  fetchHistory() {
    this.isLoading = true;
    this.api.getHistory().subscribe({
      next: (data) => { this.historyRecords = data ?? []; this.isLoading = false; },
      error: ()     => { this.toastr.error('Failed to load history'); this.isLoading = false; }
    });
  }

  exportReport(id: string) {
    this.api.exportReport(id).subscribe({
      next: (blob) => {
        if (!blob) { this.toastr.warning('Export not available yet'); return; }
        const url = window.URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `comparison-report-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toastr.error('Failed to export report')
    });
  }

  deleteRecord(id: string) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    this.api.deleteHistory(id).subscribe({
      next: () => { this.toastr.success('Record deleted'); this.fetchHistory(); },
      error: () => this.toastr.error('Failed to delete record')
    });
  }
}
