import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthStorageService } from './auth-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private authStorage: AuthStorageService) {}

  // Auth
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  verifyOtp(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/verify`, data);
  }

  // Comparison
  testConnection(env: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/comparison/connect`, env);
  }

  runComparison(request: any): Observable<any> {
    const payload = { ...request, userId: this.authStorage.getUserId() };
    return this.http.post(`${this.baseUrl}/comparison/run`, payload);
  }

  // Baselines
  getUserBaselines(): Observable<any[]> {
    const userId = this.authStorage.getUserId();
    return this.http.get<any[]>(`${this.baseUrl}/baselines/user/${userId}`);
  }

  checkBaselineExists(environmentId: string): Observable<any> {
    const userId = this.authStorage.getUserId();
    return this.http.get(`${this.baseUrl}/baselines/check?userId=${userId}&environmentId=${encodeURIComponent(environmentId)}`);
  }

  saveBaseline(body: any): Observable<any> {
    const payload = { ...body, userId: this.authStorage.getUserId() };
    return this.http.post(`${this.baseUrl}/baselines/save`, payload);
  }

  deleteBaseline(id: string): Observable<any> {
    const userId = this.authStorage.getUserId();
    return this.http.delete(`${this.baseUrl}/baselines/${userId}/${id}`);
  }

  compareWithBaseline(snapshotId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/baselines/compare/${snapshotId}`, {});
  }

  // Export
  exportReport(historyId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/comparison/export/${historyId}`, {
      responseType: 'blob'
    });
  }

  // History
  getHistory(): Observable<any[]> {
    const userId = this.authStorage.getUserId();
    return this.http.get<any[]>(`${this.baseUrl}/comparison/history/${userId}`);
  }

  deleteHistory(id: string): Observable<any> {
    const userId = this.authStorage.getUserId();
    return this.http.delete(`${this.baseUrl}/comparison/history/${userId}/${id}`);
  }
}
