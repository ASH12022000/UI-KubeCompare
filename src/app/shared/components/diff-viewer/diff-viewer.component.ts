import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as yaml from 'js-yaml';
import { LucideAngularModule, Minus, Plus, RefreshCw } from 'lucide-angular';

interface DiffLine {
  cluster1: string | null;
  cluster2: string | null;
  match: boolean;
}

@Component({
  selector: 'app-diff-viewer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './diff-viewer.component.html',
  styleUrls: ['./diff-viewer.component.css']
})
export class DiffViewerComponent implements OnChanges {
  @Input() resource1: any;
  @Input() resource2: any;
  
  diffLines: DiffLine[] = [];
  readonly icons = { Minus, Plus, RefreshCw };

  ngOnChanges() {
    this.generateDiff();
  }

  generateDiff() {
    const yaml1 = yaml.dump(this.resource1);
    const yaml2 = yaml.dump(this.resource2);
    
    const lines1 = yaml1.split('\n');
    const lines2 = yaml2.split('\n');
    const max = Math.max(lines1.length, lines2.length);
    
    this.diffLines = [];
    for (let i = 0; i < max; i++) {
      const l1 = lines1[i] || null;
      const l2 = lines2[i] || null;
      this.diffLines.push({
        cluster1: l1,
        cluster2: l2,
        match: l1 === l2
      });
    }
  }
}
