import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { User } from './user'; // Define a User interface/class
import { map } from 'rxjs';
import { switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';// Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    console.log('Registering user:', userData);
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      switchMap(() => this.login(userData.username, userData.password))
    );
  }

  login(username: string, password: string): Observable<User> {
    console.log('Logging in with:', username, password);
    return this.http.post<User>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(user => {
          // Store user data in local storage or session storage
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
    console.log('User fetched from local storage:', user);
    return of(user);
  }
  

  isAdmin(): Observable<boolean> {
    return this.getUser().pipe(
      tap(user => console.log('User in isAdmin:', user)),  // Log the user object
      map(user => !!user && user.role === 'Admin')        // Strict equality check for 'Admin'
    );
  }
  
}
