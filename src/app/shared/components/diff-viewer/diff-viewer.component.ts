import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as yaml from 'js-yaml';
import { LucideAngularModule, Minus, Plus, RefreshCw } from 'lucide-angular';
import * as Diff from 'diff';

interface DiffLine {
  cluster1: string | null;
  cluster2: string | null;
  type: 'match' | 'added' | 'removed' | 'modified';
  lineNumber1?: number;
  lineNumber2?: number;
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
    if (!this.resource1 || !this.resource2) {
      this.diffLines = [];
      return;
    }

    const yaml1 = yaml.dump(this.resource1);
    const yaml2 = yaml.dump(this.resource2);
    
    const changes = Diff.diffLines(yaml1, yaml2);
    this.diffLines = [];
    
    let line1 = 1;
    let line2 = 1;

    // We process changes to build a balanced side-by-side view
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const lines = change.value.split('\n');
      if (lines[lines.length - 1] === '') lines.pop(); // Remove trailing empty line from split

      if (change.added) {
        // If it's an addition, we might want to see if it follows a removal to show "modified"
        lines.forEach(l => {
          this.diffLines.push({
            cluster1: null,
            cluster2: l,
            type: 'added',
            lineNumber2: line2++
          });
        });
      } else if (change.removed) {
        // If it's a removal, check if next is an addition to align them
        const nextChange = changes[i + 1];
        if (nextChange && nextChange.added) {
          const nextLines = nextChange.value.split('\n');
          if (nextLines[nextLines.length - 1] === '') nextLines.pop();
          
          const max = Math.max(lines.length, nextLines.length);
          for (let j = 0; j < max; j++) {
            this.diffLines.push({
              cluster1: lines[j] || null,
              cluster2: nextLines[j] || null,
              type: 'modified',
              lineNumber1: lines[j] !== undefined ? line1++ : undefined,
              lineNumber2: nextLines[j] !== undefined ? line2++ : undefined
            });
          }
          i++; // Skip the next addition as we handled it
        } else {
          lines.forEach(l => {
            this.diffLines.push({
              cluster1: l,
              cluster2: null,
              type: 'removed',
              lineNumber1: line1++
            });
          });
        }
      } else {
        lines.forEach(l => {
          this.diffLines.push({
            cluster1: l,
            cluster2: l,
            type: 'match',
            lineNumber1: line1++,
            lineNumber2: line2++
          });
        });
      }
    }
  }
}
