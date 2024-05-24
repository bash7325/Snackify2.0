import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { User } from './user'; 
import { map } from 'rxjs';
import { switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://snackify-backend-c8a799790919.herokuapp.com/api';// Replace with MY actual API endpoint when I have it

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      switchMap(() => this.login(userData.username, userData.password))
    );
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(user => {
          // Store user data in local storage 
          localStorage.setItem('user', JSON.stringify(user));
        })
      );
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    const userString = localStorage.getItem('user');
    return !!userString;
  }

  getUser(): Observable<User | null> {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) as User : null;
    return of(user);
  }
  

  isAdmin(): Observable<boolean> {
    return this.getUser().pipe(
     // tap(user => console.log('User in isAdmin:', user)),  // Log the user object
      map(user => !!user && user.role === 'Admin')        // Strict equality check for 'Admin'
    );
  }
  
}
