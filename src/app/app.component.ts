import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public authService: AuthService, private router: Router) {} // Inject Router


  
  logout() {
    this.authService.logout();
    console.log('Logged out:', this.authService.isLoggedIn()); // Add this log
    this.router.navigate(['/']);
  }
  
}
