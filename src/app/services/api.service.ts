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

  validateToken(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/validate`);
  }

  // Settings / Profile
  getProfile(): Observable<any> {
    const userId = this.authStorage.getUserId();
    return this.http.get(`${this.baseUrl}/auth/profile/${userId}`);
  }

  updateProfile(data: any): Observable<any> {
    const userId = this.authStorage.getUserId();
    return this.http.put(`${this.baseUrl}/auth/profile/${userId}`, data);
  }

  sendChangePasswordOtp(): Observable<any> {
    const userId = this.authStorage.getUserId();
    return this.http.post(`${this.baseUrl}/auth/send-change-password-otp`, { userId });
  }

  changePassword(data: any): Observable<any> {
    const userId = this.authStorage.getUserId();
    return this.http.post(`${this.baseUrl}/auth/change-password`, { ...data, userId });
  }

  deleteAccount(confirmEmail: string): Observable<any> {
    const userId = this.authStorage.getUserId();
    // Using http.delete with body in options
    return this.http.delete(`${this.baseUrl}/auth/account/${userId}`, {
      body: { confirmEmail }
    });
  }

  reportBug(data: any): Observable<any> {
    const userId = this.authStorage.getUserId();
    return this.http.post(`${this.baseUrl}/auth/report-bug`, { ...data, userId });
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
  getBaselineById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/baselines/${id}`);
  }

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
