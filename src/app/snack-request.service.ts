import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SnackRequest } from './snack-request'; // Assuming you have an interface for the snack request data

@Injectable({
  providedIn: 'root'
})
export class SnackRequestService {
  private apiUrl = 'http://localhost:3000/api/requests'; // Update with your actual API URL

  constructor(private http: HttpClient) { }

  createRequest(requestData: SnackRequest): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post(this.apiUrl, requestData, httpOptions);
  }

  getRequests(): Observable<SnackRequest[]> {
    return this.http.get<SnackRequest[]>(this.apiUrl);
  }

  getUserRequests(userId: number): Observable<SnackRequest[]> {
    return this.http.get<SnackRequest[]>(`${this.apiUrl}/user/${userId}`);
  }

  updateRequestStatus(requestId: number, ordered: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/${requestId}/order`, { ordered }); // send ordered as a boolean 1 or 0
  }

  deleteRequest(requestId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${requestId}`);
  }
  

  // Add other methods as needed (e.g., getRequestById, updateRequest, deleteRequest)
}
