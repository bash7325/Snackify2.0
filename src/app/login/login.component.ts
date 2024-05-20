import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; 
import { AuthService } from '../auth.service'; 
import { catchError, of, switchMap, tap } from 'rxjs'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string = '';

  constructor(
    private formBuilder: FormBuilder, 
    private authService: AuthService, 
    private router: Router  // Router injection
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
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
