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
  loading = true;
  error: string | null = null;

  constructor(private snackRequestService: SnackRequestService) {}

  ngOnInit() {
    this.snackRequestService.getRequests().subscribe({ // Get all requests
      next: (requests: SnackRequest[]) => {
        this.snackRequests = requests;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'Error fetching snack requests';
      }
    });
  }
}
