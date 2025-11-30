import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { SnackRequestService } from './snack-request.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  navbarOpen = false;
  helpModalOpen = false;
  pendingRequestCount = 0;

  constructor(
    public authService: AuthService, 
    private snackRequestService: SnackRequestService,
    private router: Router
  ) {} 

  ngOnInit() {
    this.loadPendingRequestCount();
    // Refresh count every 30 seconds if admin is logged in
    setInterval(() => {
      if (this.authService.isAdmin()) {
        this.loadPendingRequestCount();
      }
    }, 30000);
  }

  loadPendingRequestCount() {
    this.authService.isAdmin().subscribe(isAdmin => {
      if (isAdmin) {
        this.snackRequestService.getPendingRequestCount().subscribe(
          response => {
            this.pendingRequestCount = response.count;
          },
          error => {
            console.error('Error fetching pending count:', error);
          }
        );
      }
    });
  }

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
