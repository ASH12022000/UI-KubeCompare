import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, Database, Plus, Play, Trash2, Loader2, Clock, Server, X, CheckCircle, Globe, Terminal, Upload, FileCheck, RotateCw, Eye, BarChart3, ChevronRight } from 'lucide-angular';
import { DiffViewerComponent } from '../shared/components/diff-viewer/diff-viewer.component';

@Component({
  selector: 'app-baselines',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, DiffViewerComponent],
  templateUrl: './baselines.component.html'
})
export class BaselinesComponent implements OnInit {
  baselines: any[] = [];
  isLoading = true;
  showForm = false;
  isSaving = false;
  isComparing = false;
  comparingId: string | null = null;
  deletingId:  string | null = null;
  refreshingId: string | null = null;
  
  viewingBaseline: any = null;
  showViewModal = false;

  comparisonResults: any = null;
  showResults = false;
  selectedResource: any = null;

  conflict: { exists: boolean; existingId: string; existingName: string } | null = null;

  baselineForm: FormGroup;
  readonly icons = { Database, Plus, Play, Trash2, Loader2, Clock, Server, X, CheckCircle, Globe, Terminal, Upload, FileCheck, RotateCw, Eye, BarChart3, ChevronRight };

  constructor(
    private fb:     FormBuilder,
    private api:    ApiService,
    private toastr: ToastrService
  ) {
    this.baselineForm = this.fb.group({
      name:           ['', Validators.required],
      connectionType: ['JUMP', Validators.required],
      clusterUrl:     [''],
      token:          [''],
      jumpHost:       [''],
      jumpUser:       [''],
      jumpPassword:   [''],
      kubeconfig:     [''],
      namespace:      ['default', Validators.required],
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

  openForm()  { 
    this.showForm = true;  
    this.conflict = null; 
    this.baselineForm.reset({ 
      name: '', 
      namespace: 'default', 
      connectionType: 'JUMP',
      clusterUrl: '',
      token: '',
      jumpHost: '',
      jumpUser: '',
      jumpPassword: '',
      kubeconfig: '',
      checks: {
        DEPLOYMENTS: true,
        CONFIGMAPS: true,
        SERVICES: true,
        PVC: false,
        IMAGES: true,
        VIRTUALSERVICES: false,
        AUTH_POLICY: false
      }
    }); 
    this.updateValidators('JUMP');
  }
  closeForm() { this.showForm = false; this.conflict = null; }

  setConnectionType(type: 'DIRECT' | 'JUMP' | 'KUBECONFIG') {
    this.baselineForm.patchValue({ connectionType: type });
    this.updateValidators(type);
  }

  private updateValidators(type: string) {
    const clusterUrl = this.baselineForm.get('clusterUrl');
    const token = this.baselineForm.get('token');
    const jumpHost = this.baselineForm.get('jumpHost');
    const jumpUser = this.baselineForm.get('jumpUser');
    const jumpPassword = this.baselineForm.get('jumpPassword');
    const kubeconfig = this.baselineForm.get('kubeconfig');

    // Clear all validators first
    [clusterUrl, token, jumpHost, jumpUser, jumpPassword, kubeconfig].forEach(c => {
      c?.clearValidators();
      c?.updateValueAndValidity();
    });

    if (type === 'DIRECT') {
      clusterUrl?.setValidators([Validators.required]);
      token?.setValidators([Validators.required]);
    } else if (type === 'JUMP') {
      clusterUrl?.setValidators([Validators.required]);
      token?.setValidators([Validators.required]);
      jumpHost?.setValidators([Validators.required]);
      jumpUser?.setValidators([Validators.required]);
      jumpPassword?.setValidators([Validators.required]);
    } else if (type === 'KUBECONFIG') {
      kubeconfig?.setValidators([Validators.required]);
    }

    [clusterUrl, token, jumpHost, jumpUser, jumpPassword, kubeconfig].forEach(c => c?.updateValueAndValidity());
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.baselineForm.patchValue({ kubeconfig: e.target.result });
        this.toastr.info('Kubeconfig file loaded');
      };
      reader.readAsText(file);
    }
  }

  onSubmit(override = false) {
    if (this.baselineForm.invalid) { this.baselineForm.markAllAsTouched(); return; }
    this.isSaving = true;
    this.conflict = null;

    const formVal = this.baselineForm.value;
    const checks  = Object.keys(formVal.checks).filter(k => formVal.checks[k]);
    const payload = {
      name:           formVal.name,
      namespace:      formVal.namespace,
      clusterUrl:     formVal.clusterUrl,
      token:          formVal.token,
      jumpHost:       formVal.jumpHost,
      jumpUser:       formVal.jumpUser,
      jumpPassword:   formVal.jumpPassword,
      kubeconfig:     formVal.kubeconfig,
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
    this.showResults  = false;
    this.comparisonResults = null;

    this.api.compareWithBaseline(baseline.id).subscribe({
      next: (results) => {
        this.isComparing = false;
        this.comparingId = null;
        this.comparisonResults = results;
        this.showResults = true;
        this.toastr.success('Comparison complete!');
      },
      error: (err) => {
        this.isComparing = false;
        this.comparingId = null;
        this.toastr.error('Comparison failed: ' + (err.error?.error || err.message));
      }
    });
  }

  onView(b: any) {
    this.isLoading = true;
    this.api.getBaselineById(b.id).subscribe({
      next: (fullBaseline) => {
        this.viewingBaseline = fullBaseline;
        this.showViewModal = true;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to fetch baseline details');
        this.isLoading = false;
      }
    });
  }

  closeView() {
    this.showViewModal = false;
    this.viewingBaseline = null;
  }

  onRefresh(id: string) {
    this.refreshingId = id;
  }

  cancelRefresh() {
    this.refreshingId = null;
  }

  confirmRefresh(b: any) {
    this.isSaving = true;
    const payload = {
      name: b.name,
      userId: b.userId,
      namespace: b.namespace,
      clusterUrl: b.clusterUrl,
      token: b.token,
      jumpHost: b.jumpHost,
      jumpUser: b.jumpUser,
      jumpPassword: b.jumpPassword,
      kubeconfig: b.kubeconfig,
      override: true,
      checks: Object.keys(b.resourceSpecs || {}).map(k => k.toUpperCase())
    };

    this.api.saveBaseline(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.refreshingId = null;
        this.toastr.success('Baseline refreshed successfully');
        this.fetchBaselines();
      },
      error: (err) => {
        this.isSaving = false;
        this.refreshingId = null;
        this.toastr.error('Refresh failed: ' + (err.error?.error || err.message));
      }
    });
  }

  closeResults() {
    this.showResults = false;
    this.comparisonResults = null;
  }

  onDelete(id: string) {
    console.log('[Baselines] Delete requested for id:', id);
    this.deletingId = id;
  }

  cancelDelete() {
    this.deletingId = null;
  }

  confirmDelete(id: string) {
    console.log('[Baselines] Confirming delete for id:', id);
    this.api.deleteBaseline(id).subscribe({
      next: () => { 
        console.log('[Baselines] Delete SUCCESS');
        this.toastr.success('Baseline deleted'); 
        this.deletingId = null;
        this.fetchBaselines(); 
      },
      error: (err)  => {
        console.error('[Baselines] Delete FAILED', err);
        this.toastr.error('Delete failed');
        this.deletingId = null;
      }
    });
  }

  getChangeCount(resources: any[]): number {
    if (!resources) return 0;
    return resources.filter(r => r.status !== 'MATCH').length;
  }
}
