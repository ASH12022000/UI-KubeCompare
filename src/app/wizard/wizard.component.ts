import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, Server, Target, CheckSquare, BarChart3, ChevronRight, ChevronLeft, Globe, Terminal, Loader2, Search, X, Upload, FileCheck } from 'lucide-angular';
import { DiffViewerComponent } from '../shared/components/diff-viewer/diff-viewer.component';

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, DiffViewerComponent],
  templateUrl: './wizard.component.html'
})
export class WizardComponent {
  currentStep = 1;
  isLoading = false;
  results: Record<string, any[]> | null = null;
  selectedResource: any = null;
  globalConnectionType: 'DIRECT' | 'JUMP' | 'KUBECONFIG' = 'JUMP';

  readonly icons = { Server, Target, CheckSquare, BarChart3, ChevronRight, ChevronLeft, Globe, Terminal, Loader2, Search, X, Upload, FileCheck };

  // Form Groups for different steps
  credentialsForm: FormGroup;
  scopeForm: FormGroup;
  selectionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toastr: ToastrService
  ) {
    this.credentialsForm = this.fb.group({
      cluster1: this.fb.group({
        url: ['', Validators.required],
        token: ['', Validators.required],
        type: ['JUMP'],
        jumpHost: [''],
        jumpUser: [''],
        jumpPassword: [''],
        kubeconfig: ['']
      }),
      cluster2: this.fb.group({
        url: ['', Validators.required],
        token: ['', Validators.required],
        type: ['JUMP'],
        jumpHost: [''],
        jumpUser: [''],
        jumpPassword: [''],
        kubeconfig: ['']
      })
    });

    this.scopeForm = this.fb.group({
      ns1: ['default', Validators.required],
      ns2: ['default', Validators.required]
    });

    this.selectionForm = this.fb.group({
      DEPLOYMENTS: [true],
      CONFIGMAPS: [true],
      SERVICES: [true],
      PVC: [false],
      IMAGES: [true],
      VIRTUALSERVICES: [false],
      AUTH_POLICY: [false]
    });
  }

  selectResource(item: any) {
    this.selectedResource = item;
  }

  closeDiff() {
    this.selectedResource = null;
  }

  setConnectionType(type: 'DIRECT' | 'JUMP' | 'KUBECONFIG') {
    this.globalConnectionType = type;
    this.credentialsForm.get('cluster1.type')?.setValue(type);
    this.credentialsForm.get('cluster2.type')?.setValue(type);
  }

  nextStep() {
    if (this.currentStep < 4) {
      if (this.currentStep === 1) {
         // Optionally test connections here
      }
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  runComparison() {
    this.isLoading = true;
    const request = {
      env1: this.credentialsForm.value.cluster1,
      env2: this.credentialsForm.value.cluster2,
      ns1: this.scopeForm.value.ns1,
      ns2: this.scopeForm.value.ns2,
      checks: Object.keys(this.selectionForm.value).filter(key => this.selectionForm.value[key])
    };

    this.api.runComparison(request).subscribe({
      next: (res) => {
        this.results = res;
        this.isLoading = false;
        this.nextStep(); // Move to results step
        this.toastr.success('Comparison completed successfully');
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Comparison failed: ' + err.message);
      }
    });
  }

  onFileSelected(event: any, cluster: 'cluster1' | 'cluster2') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const content = e.target.result;
        this.credentialsForm.get(`${cluster}.kubeconfig`)?.setValue(content);
        this.toastr.info(`Loaded kubeconfig for ${cluster === 'cluster1' ? 'Primary' : 'Comparison'} Cluster`);
      };
      reader.readAsText(file);
    }
  }
}
