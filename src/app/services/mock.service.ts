import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';

/**
 * Toggle USE_MOCK to true to serve data from mock-data.json
 * instead of making real backend API calls.
 */
export const USE_MOCK = true;

@Injectable({ providedIn: 'root' })
export class MockService {
  private mockUrl = '/assets/mock-data.json';

  constructor(private http: HttpClient, private api: ApiService) {}

  private getMock(): Observable<any> {
    return this.http.get<any>(this.mockUrl);
  }

  getHistory(): Observable<any[]> {
    if (USE_MOCK) {
      return this.getMock().pipe(switchMap(d => of(d.history)));
    }
    return this.api.getHistory();
  }

  deleteHistory(id: string): Observable<any> {
    if (USE_MOCK) {
      console.warn('[MOCK] deleteHistory called for id:', id);
      return of({ success: true });
    }
    return this.api.deleteHistory(id);
  }

  exportReport(id: string): Observable<any> {
    if (USE_MOCK) {
      console.warn('[MOCK] exportReport called for id:', id);
      return of(null);
    }
    return this.api.exportReport(id);
  }

  getUserBaselines(): Observable<any[]> {
    if (USE_MOCK) {
      return this.getMock().pipe(switchMap(d => of(d.baselines)));
    }
    return this.api.getUserBaselines();
  }

  deleteBaseline(id: string): Observable<any> {
    if (USE_MOCK) {
      console.warn('[MOCK] deleteBaseline called for id:', id);
      return of({ success: true });
    }
    return this.api.deleteBaseline(id);
  }

  compareWithBaseline(id: string): Observable<any> {
    if (USE_MOCK) {
      console.warn('[MOCK] compareWithBaseline called for id:', id);
      return of({ message: 'Mock: no diff in mock mode' });
    }
    return this.api.compareWithBaseline(id);
  }

  saveBaseline(body: any): Observable<any> {
    if (USE_MOCK) {
      console.warn('[MOCK] saveBaseline called', body);
      return of({ id: 'mock-new', ...body });
    }
    return this.api.saveBaseline(body);
  }
}
