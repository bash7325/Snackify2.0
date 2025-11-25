import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; 
import { AuthService } from '../auth.service'; 
import { catchError, of, switchMap, tap } from 'rxjs'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginError: string = '';
  successMessage: string = '';

  constructor(
    private formBuilder: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Check if user was just registered
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.successMessage = 'Account created successfully! You can now login.';
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // Clear success message when attempting to login
      this.successMessage = '';
      
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).pipe(
        switchMap(user => this.authService.isAdmin().pipe(catchError(err => of(false)))),
        tap(isAdmin => {
          if (isAdmin) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/request']);
          }
        })
      ).subscribe(
        () => {/* Handle success (if needed) */},
        error => {
          this.loginError = error.message || 'Invalid username or password';
        }
      );
    }
  }
}
