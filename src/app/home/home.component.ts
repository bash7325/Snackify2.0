import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    // Check authentication status and redirect if necessary
    if (this.authService.isLoggedIn()) {
      this.authService.isAdmin().subscribe(isAdmin => {
        if (isAdmin) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/request']);
        }
      });
    }
  }

}

