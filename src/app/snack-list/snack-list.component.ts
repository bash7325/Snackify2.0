import { Component, OnInit } from '@angular/core';
import { SnackRequestService } from '../snack-request.service';
import { SnackRequest } from '../snack-request';

@Component({
  selector: 'app-snack-list',
  templateUrl: './snack-list.component.html',
  styleUrls: ['./snack-list.component.css']
})
export class SnackListComponent implements OnInit {
  snackRequests: SnackRequest[] = [];
  loading = false;
  error: string | null = null;

  constructor(private snackRequestService: SnackRequestService) {}

  ngOnInit() {
    this.loading = true;
    console.log('SnackListComponent: Starting to load requests');
    console.log('SnackListComponent: Initial snackRequests:', this.snackRequests);
    
    this.snackRequestService.getRequests().subscribe({ 
      next: (requests: SnackRequest[]) => {
        console.log('SnackListComponent: Received requests:', requests);
        console.log('SnackListComponent: Type of requests:', typeof requests);
        console.log('SnackListComponent: Is array?', Array.isArray(requests));
        console.log('SnackListComponent: Length:', requests ? requests.length : 'undefined');
        
        this.snackRequests = requests || [];
        this.loading = false;
        
        console.log('SnackListComponent: After assignment, snackRequests:', this.snackRequests);
        console.log('SnackListComponent: After assignment, length:', this.snackRequests.length);
      },
      error: (error) => {
        console.error('SnackListComponent: Error loading requests:', error);
        this.loading = false;
        this.error = error.message || 'Error fetching snack requests';
      },
      complete: () => {
        console.log('SnackListComponent: Observable completed');
      }
    });
  }
}
