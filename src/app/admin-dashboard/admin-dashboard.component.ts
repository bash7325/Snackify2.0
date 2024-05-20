import { Component, OnInit } from '@angular/core';
import { SnackRequestService } from '../snack-request.service';
import { SnackRequest } from '../snack-request';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  snackRequests: SnackRequest[] = [];
  orderedRequests: SnackRequest[] = [];
  loading = true;  // Flag to indicate loading state
  error: string | null = null; // Error message

  constructor(private snackRequestService: SnackRequestService) {}

  ngOnInit() {
    this.snackRequestService.getRequests().subscribe({
      next: (requests: SnackRequest[]) => {
         this.snackRequests = requests.filter(req => req.ordered_flag === 0); // Filter pending requests
        this.orderedRequests = requests.filter(req => req.ordered_flag === 1); // Filter ordered requests
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'Error fetching snack requests';
      }
    });
  }

  markAsOrdered(request: SnackRequest) {
    if (request.id !== undefined) {
      this.snackRequestService.updateRequestStatus(request.id, true).subscribe(
        () => {
          request.ordered_flag = 1;
          request.ordered_at = new Date().toISOString();
          this.orderedRequests.push(request);
          this.snackRequests = this.snackRequests.filter(req => req.id !== request.id);
  
          this.orderedRequests.sort((a, b) => {
            
            const aOrderedAtTime = a.ordered_at ? new Date(a.ordered_at).getTime() : 0; 
            const bOrderedAtTime = b.ordered_at ? new Date(b.ordered_at).getTime() : 0; 
            return bOrderedAtTime - aOrderedAtTime; 
          });
        },
        error => {
          console.error('Error updating request:', error);
        }
      );
    } else {
      console.error('Error: request.id is undefined');
      
    }
  }

  deleteRequest(request: SnackRequest) {
    if (confirm('Are you sure you want to delete this request?')) { 
      this.snackRequestService.deleteRequest(request.id!).subscribe(
        () => {
          this.snackRequests = this.snackRequests.filter(req => req.id !== request.id);
          this.orderedRequests = this.orderedRequests.filter(req => req.id !== request.id);
        },
        error => {
          console.error('Error deleting request:', error);
        }
      );
    }
  }
  
}
