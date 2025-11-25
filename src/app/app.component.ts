import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  navbarOpen = false;
  helpModalOpen = false;

  constructor(public authService: AuthService, private router: Router) {} 

  logout() {
    this.authService.logout();
    console.log('Logged out:', this.authService.isLoggedIn());
    this.router.navigate(['/']);
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  showHelpModal() {
    this.helpModalOpen = true;
  }

  closeHelpModal() {
    this.helpModalOpen = false;
  }
}
