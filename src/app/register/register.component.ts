import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  registerError: string | null = null;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      name: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get passwordMismatch(): boolean {
    return this.registerForm.hasError('passwordMismatch') && 
           (this.registerForm.get('confirmPassword')?.touched || false);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...registrationData } = this.registerForm.value;
      
      this.authService.register(registrationData).subscribe({
        next: () => {
          // Registration successful - redirect to login with success message
          console.log('Registration successful');
          this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
        },
        error: (error) => {
          this.registerError = error.message || 'Registration failed';
        }
      });
    }
  }
}
