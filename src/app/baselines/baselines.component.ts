import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, Database, Plus, Play, Trash2, Loader2, Clock, Server, X, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-baselines',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './baselines.component.html'
})
export class BaselinesComponent implements OnInit {
  baselines: any[] = [];
  isLoading = true;
  showForm = false;
  isSaving = false;
  isComparing = false;
  comparingId: string | null = null;

  conflict: { exists: boolean; existingId: string; existingName: string } | null = null;

  baselineForm: FormGroup;
  readonly icons = { Database, Plus, Play, Trash2, Loader2, Clock, Server, X, CheckCircle };

  constructor(
    private fb:     FormBuilder,
    private api:    ApiService,
    private toastr: ToastrService
  ) {
    this.baselineForm = this.fb.group({
      name:         ['', Validators.required],
      jumpHost:     ['', Validators.required],
      jumpUser:     ['', Validators.required],
      jumpPassword: ['', Validators.required],
      namespace:    ['default', Validators.required],
      checks: this.fb.group({
        DEPLOYMENTS:     [true],
        CONFIGMAPS:      [true],
        SERVICES:        [true],
        PVC:             [false],
        IMAGES:          [true],
        VIRTUALSERVICES: [false],
        AUTH_POLICY:     [false],
      })
    });
  }

  ngOnInit() { this.fetchBaselines(); }

  fetchBaselines() {
    this.isLoading = true;
    this.api.getUserBaselines().subscribe({
      next: (data) => { this.baselines = data ?? []; this.isLoading = false; },
      error: ()     => { this.toastr.error('Failed to load baselines'); this.isLoading = false; }
    });
  }

  openForm()  { this.showForm = true;  this.conflict = null; this.baselineForm.reset({ namespace: 'default' }); }
  closeForm() { this.showForm = false; this.conflict = null; }

  onSubmit(override = false) {
    if (this.baselineForm.invalid) { this.baselineForm.markAllAsTouched(); return; }
    this.isSaving = true;
    this.conflict = null;

    const formVal = this.baselineForm.value;
    const checks  = Object.keys(formVal.checks).filter(k => formVal.checks[k]);
    const payload = {
      name:         formVal.name,
      namespace:    formVal.namespace,
      jumpHost:     formVal.jumpHost,
      jumpUser:     formVal.jumpUser,
      jumpPassword: formVal.jumpPassword,
      checks,
      override
    };

    this.api.saveBaseline(payload).subscribe({
      next: () => {
        this.toastr.success(`Baseline "${formVal.name}" saved!`);
        this.isSaving = false;
        this.closeForm();
        this.fetchBaselines();
      },
      error: (err) => {
        this.isSaving = false;
        if (err.status === 409) {
          this.conflict = {
            exists:       true,
            existingId:   err.error?.existingId   ?? '',
            existingName: err.error?.existingName ?? 'existing baseline'
          };
        } else {
          this.toastr.error('Failed to save baseline: ' + (err.error?.error ?? err.message));
        }
      }
    });
  }

  onOverride() { this.onSubmit(true); }

  onCompare(baseline: any) {
    this.isComparing  = true;
    this.comparingId  = baseline.id;
    this.api.compareWithBaseline(baseline.id).subscribe({
      next: (results) => {
        this.isComparing = false;
        this.comparingId = null;
        this.toastr.success('Comparison complete!');
        console.log('[Baseline Comparison Results]', results);
      },
      error: () => {
        this.isComparing = false;
        this.comparingId = null;
        this.toastr.error('Comparison failed');
      }
    });
  }

  onDelete(id: string) {
    if (!confirm('Delete this baseline?')) return;
    this.api.deleteBaseline(id).subscribe({
      next: () => { this.toastr.success('Baseline deleted'); this.fetchBaselines(); },
      error: ()  => this.toastr.error('Delete failed')
    });
  }
}
