import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SnackRequestService } from '../snack-request.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { SnackRequest } from '../snack-request';
import { User } from '../user';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.css']
})
export class RequestFormComponent implements OnInit {
  requestForm: FormGroup;
  userId: number | null = null;
  submitting = false;
  submitError: string | null = null;
  showSuccessMessage = false;
  userRequests: SnackRequest[] = [];
  userName: string | null | undefined = null; // Fix the type of userName

  constructor(
    private formBuilder: FormBuilder,
    private snackRequestService: SnackRequestService,
    private authService: AuthService,
    private router: Router
  ) {
    this.requestForm = this.formBuilder.group({
      type: ['snack'], 
      item: [''],
      link: ['']
    });
  }

  ngOnInit() {
    // Get the user ID from the auth service
    this.authService.getUser().subscribe(user => { 
      this.userId = user ? user.id : null;
      this.userName = user ? user.name : null; 
    });
    this.loadUserRequests()
  }

  private loadUserRequests() {
    if (this.userId) {
      this.snackRequestService.getUserRequests(this.userId).subscribe(
        requests => {
          this.userRequests = requests;
        },
        error => {
          console.error('Error fetching user requests:', error);
        }
      );
    }
  }

  onSubmit() {
    console.log("Submit button clicked"); // This confirms the button works

    this.authService.getUser().subscribe(user => {
      if (user) {
        this.userId = user.id;
        console.log("User ID:", this.userId);
        console.log("Form Data:", this.requestForm.value);

        this.submitting = true;
        this.submitError = null; 

        const { type, item, link } = this.requestForm.value;

        // Create requestData
        const requestData: SnackRequest = { 
          user_id: this.userId!,
          snack: item, 
          drink: item, 
          misc: item,
          link: link
        };

        // Set the correct type to empty string based on the selected type
        if (type !== 'snack') {
          requestData.snack = '';
        }

        if (type !== 'drink') {
          requestData.drink = '';
        }

        if (type !== 'misc') {
          requestData.misc = '';
        }

        this.snackRequestService.createRequest(requestData).subscribe({
            next: response => {
                // Handle successful submission
                this.requestForm.reset();
                this.submitting = false; // Reset submitting flag
                this.showSuccessMessage = true;
                console.log('Request submitted successfully!', response);
                setTimeout(() => {
                this.showSuccessMessage = false;
                }, 3000);
                this.loadUserRequests();
            },
            error: (error) => {
                this.submitting = false;
                this.submitError = error.message || 'An error occurred while submitting the request.';
                console.error('Error submitting request:', error);
            }
        });
    } else {
        this.submitError = 'Please log in to submit a request.';
    }
  });
}
}