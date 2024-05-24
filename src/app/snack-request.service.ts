import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SnackRequest } from './snack-request'; 

@Injectable({
  providedIn: 'root'
})
export class SnackRequestService {
private apiUrl = 'https://snackify-backend-c8a799790919.herokuapp.com/api/requests';

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

  updateKeepOnHandStatus(requestId: number, keepOnHand: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/${requestId}/keep`, { keep_on_hand: keepOnHand ? 1 : 0 }); 
  }  

  deleteRequest(requestId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${requestId}`);
  }
  
}
