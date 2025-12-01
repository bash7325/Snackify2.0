import { Component, OnInit } from '@angular/core';
import { SnackRequestService } from '../snack-request.service';
import { SnackRequest } from '../snack-request';
import { AuthService } from '../auth.service';
import { User } from '../user';
import Fuse from 'fuse.js';

interface Stats {
  totalPending: number;
  totalOrdered: number;
  totalKeepOnHand: number;
  orderedThisWeek: number;
  orderedThisMonth: number;
  topSnacks: {name: string, count: number, variants?: string[]}[];
  topUsers: {name: string, count: number}[];
  avgDaysToOrder: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  snackRequests: SnackRequest[] = [];
  orderedRequests: SnackRequest[] = [];
  keepOnHand: SnackRequest[] = [];
  allRequests: SnackRequest[] = [];
  
  // Filtered/sorted arrays
  filteredSnackRequests: SnackRequest[] = [];
  filteredOrderedRequests: SnackRequest[] = [];
  filteredKeepOnHand: SnackRequest[] = [];
  
  loading = true;
  error: string | null = null;
  
  // Search and filter
  searchTerm = '';
  dateFilter = 'all'; // all, week, month
  
  // Bulk actions
  selectedPending: Set<number> = new Set();
  selectAllPending = false;
  
  // Sorting
  pendingSortColumn = 'created_at';
  pendingSortDirection: 'asc' | 'desc' = 'desc';
  orderedSortColumn = 'ordered_at';
  orderedSortDirection: 'asc' | 'desc' = 'desc';
  
  // UI state
  activeTab: 'pending' | 'ordered' | 'keepOnHand' | 'users' = 'pending';
  showStats = true;
  undoStack: {request: SnackRequest, action: string}[] = [];
  
  // Statistics
  stats: Stats = {
    totalPending: 0,
    totalOrdered: 0,
    totalKeepOnHand: 0,
    orderedThisWeek: 0,
    orderedThisMonth: 0,
    topSnacks: [],
    topUsers: [],
    avgDaysToOrder: 0
  };

  // User Management
  users: User[] = [];
  filteredUsers: User[] = [];
  editingUser: User | null = null;
  resettingPasswordUser: User | null = null;
  newPassword = '';

  constructor(
    private snackRequestService: SnackRequestService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.snackRequestService.getRequests().subscribe({
      next: (requests: SnackRequest[]) => {
        this.allRequests = requests;
        this.snackRequests = requests.filter(req => req.ordered_flag === 0);
        this.orderedRequests = requests.filter(req => req.ordered_flag === 1);
        this.keepOnHand = requests.filter(req => req.keep_on_hand === 1);
        
        this.calculateStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'Error fetching snack requests';
      }
    });
  }

  calculateStats() {
    this.stats.totalPending = this.snackRequests.length;
    this.stats.totalOrdered = this.orderedRequests.length;
    this.stats.totalKeepOnHand = this.keepOnHand.length;
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    this.stats.orderedThisWeek = this.orderedRequests.filter(r => 
      r.ordered_at && new Date(r.ordered_at) >= weekAgo
    ).length;
    
    this.stats.orderedThisMonth = this.orderedRequests.filter(r => 
      r.ordered_at && new Date(r.ordered_at) >= monthAgo
    ).length;
    
    // Top snacks with enhanced fuzzy matching
    const snackCounts: {[key: string]: {count: number, variants: string[]}} = {};
    
    // Normalize string: remove plurals, punctuation, extra spaces
    const normalizeString = (str: string): string => {
      return str.toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .replace(/\s+/g, ' ') // Multiple spaces to single
        .replace(/s\b/g, '') // Remove trailing 's' for plurals
        .trim();
    };
    
    // Categorize snacks using smart keyword extraction with fuse.js
    const categorizeSnack = (snack: string): string => {
      const lower = snack.toLowerCase().trim();
      const normalized = normalizeString(snack);
      
      // Expanded brand/category mappings with variations and common misspellings
      const categories: {[key: string]: string[]} = {
        'Pop Tarts': ['pop tart', 'poptart', 'pop-tart', 'poptarts', 'pop tarts'],
        'Cheez-Its': ['cheez it', 'cheezit', 'cheez-it', 'cheese it', 'cheezits', 'cheese its', 'chees it', 'cheez its'],
        'Goldfish': ['goldfish', 'gold fish', 'goldfish cracker', 'golfish'],
        'Oreos': ['oreo', 'oreos', 'orieo', 'orieos', 'oreo cookie'],
        'Chips Ahoy': ['chips ahoy', 'chip ahoy', 'chipsahoy', 'chips ahoy cookie'],
        'Doritos': ['dorito', 'doritos', 'dorritos', 'doritto', 'dorito chip'],
        'Cheetos': ['cheeto', 'cheetos', 'hot cheeto', 'flamin hot', 'flaming hot', 'flammin hot', 'cheato', 'cheatos'],
        'Fritos': ['frito', 'fritos', 'frito chip', 'freetos'],
        'Lays': ['lay chip', 'lays chip', 'lays', 'lay', 'lays potato chip'],
        'Pringles': ['pringle', 'pringles', 'pringel', 'pringels'],
        'Ritz': ['ritz cracker', 'ritz', 'ritz crackers'],
        'Wheat Thins': ['wheat thin', 'wheat thins', 'wheatthins'],
        'Triscuits': ['triscuit', 'triscuits', 'triscit'],
        'Snickers': ['snicker', 'snickers', 'sniker', 'snikkers'],
        'M&Ms': ['m&m', 'mnm', 'm and m', 'm&ms', 'mnms'],
        'Reeses': ['reese', 'reeses', 'peanut butter cup', 'reese cup', 'reeses cup', 'reese piece', 'reeses pieces'],
        'Kit Kat': ['kit kat', 'kitkat', 'kit-kat', 'kikat'],
        'Twix': ['twix', 'twix bar'],
        'Skittles': ['skittle', 'skittles', 'skitle', 'skitles'],
        'Starburst': ['starburst', 'star burst', 'starbursts'],
        'Granola Bars': ['granola bar', 'nature valley', 'granola', 'naturevalley', 'nature valley bar'],
        'Protein Bars': ['protein bar', 'cliff bar', 'clif bar', 'quest bar', 'protein', 'kind bar', 'rx bar'],
        'Rice Krispies': ['rice krispie', 'rice crispy', 'rice krispies', 'rice krispie treat', 'krispie treat'],
        'Fruit Snacks': ['fruit snack', 'gusher', 'fruit roll', 'fruit rollup', 'welch fruit snack'],
        'Nutri-Grain': ['nutri grain', 'nutrigrain', 'nutri-grain', 'nutri grain bar'],
        'Crackers': ['cracker', 'saltine', 'saltines', 'crackers'],
        'Pretzels': ['pretzel', 'pretzels', 'pretsel'],
        'Popcorn': ['popcorn', 'pop corn', 'smartfood', 'kettle corn'],
        'Trail Mix': ['trail mix', 'mixed nut', 'trailmix', 'trail'],
        'Peanuts': ['peanut', 'planter', 'planters', 'peanuts', 'planters peanut'],
        'Almonds': ['almond', 'almonds'],
        'Cashews': ['cashew', 'cashews', 'cashoo'],
        'Cookies': ['cookie', 'chocolate chip cookie', 'cookies', 'choc chip'],
        'Brownies': ['brownie', 'cosmic brownie', 'brownies', 'cosmic'],
        'Muffins': ['muffin', 'muffins'],
        'Donuts': ['donut', 'doughnut', 'krispy kreme', 'donuts', 'doughnuts', 'dunkin'],
        'Candy Bars': ['candy bar', 'chocolate bar', 'candy', 'candybar'],
        'Gum': ['gum', 'chewing gum', 'bubblegum', 'bubble gum'],
        'Mints': ['mint', 'tic tac', 'altoid', 'mints', 'tictac', 'altoids'],
        'Soda': ['coke', 'coca cola', 'pepsi', 'soda', 'pop', 'cola', 'diet coke', 'coke zero', 'dr pepper'],
        'Energy Drinks': ['red bull', 'monster', 'redbull', 'energy drink', 'rockstar'],
        'Water': ['water', 'aquafina', 'dasani', 'sparkling water', 'la croix'],
        'Gatorade': ['gatorade', 'gatoraid', 'powerade', 'sports drink']
      };
      
      // Check exact and normalized matches first
      for (const [category, keywords] of Object.entries(categories)) {
        for (const keyword of keywords) {
          if (lower.includes(keyword) || normalized.includes(normalizeString(keyword))) {
            return category;
          }
        }
      }
      
      // If no exact match, use fuse.js ONLY on individual keywords for typo tolerance
      // Build a flat list of all keywords with their category
      const keywordList: {keyword: string, category: string}[] = [];
      Object.entries(categories).forEach(([category, keywords]) => {
        keywords.forEach(kw => keywordList.push({keyword: kw, category}));
      });
      
      const fuse = new Fuse(keywordList, {
        keys: ['keyword'],
        threshold: 0.2, // Stricter threshold (only 1-2 character differences)
        distance: 50,
        includeScore: true
      });
      
      const fuseResult = fuse.search(normalized);
      if (fuseResult.length > 0 && fuseResult[0].score! < 0.2) {
        return fuseResult[0].item.category;
      }
      
      // If no match found, return the exact original snack name
      // This prevents incorrect grouping of unrelated items
      return snack;
    };
    
    this.allRequests.forEach(r => {
      if (r.snack) {
        const category = categorizeSnack(r.snack);
        if (!snackCounts[category]) {
          snackCounts[category] = {count: 0, variants: []};
        }
        snackCounts[category].count++;
        // Track unique variants (case-insensitive)
        const lowerVariant = r.snack.toLowerCase();
        if (!snackCounts[category].variants.some(v => v.toLowerCase() === lowerVariant)) {
          // Only add as variant if the snack name is different from the category name
          // This prevents unrelated items from showing as variants
          if (r.snack.toLowerCase() !== category.toLowerCase()) {
            snackCounts[category].variants.push(r.snack);
          }
        }
      }
    });
    
    this.stats.topSnacks = Object.entries(snackCounts)
      .map(([name, {count, variants}]) => ({
        name, 
        count, 
        variants: variants.length > 1 ? variants.slice(0, 3) : undefined
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Top users
    const userCounts: {[key: string]: number} = {};
    this.allRequests.forEach(r => {
      if (r.user_name) userCounts[r.user_name] = (userCounts[r.user_name] || 0) + 1;
    });
    this.stats.topUsers = Object.entries(userCounts)
      .map(([name, count]) => ({name, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Average days to order
    const orderedWithBothDates = this.orderedRequests.filter(r => 
      r.created_at && r.ordered_at
    );
    if (orderedWithBothDates.length > 0) {
      const totalDays = orderedWithBothDates.reduce((sum, r) => {
        const created = new Date(r.created_at!).getTime();
        const ordered = new Date(r.ordered_at!).getTime();
        return sum + (ordered - created) / (1000 * 60 * 60 * 24);
      }, 0);
      this.stats.avgDaysToOrder = Math.round(totalDays / orderedWithBothDates.length);
    }
  }

  applyFilters() {
    let pending = [...this.snackRequests];
    let ordered = [...this.orderedRequests];
    let keepHand = [...this.keepOnHand];
    
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      const filterFn = (r: SnackRequest) => 
        r.user_name?.toLowerCase().includes(term) ||
        r.snack?.toLowerCase().includes(term) ||
        r.drink?.toLowerCase().includes(term) ||
        r.misc?.toLowerCase().includes(term);
      
      pending = pending.filter(filterFn);
      ordered = ordered.filter(filterFn);
      keepHand = keepHand.filter(filterFn);
    }
    
    // Date filter
    if (this.dateFilter !== 'all') {
      const now = new Date();
      const daysAgo = this.dateFilter === 'week' ? 7 : 30;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      pending = pending.filter(r => r.created_at && new Date(r.created_at) >= cutoffDate);
      ordered = ordered.filter(r => r.ordered_at && new Date(r.ordered_at) >= cutoffDate);
    }
    
    // Sort
    pending = this.sortRequests(pending, this.pendingSortColumn, this.pendingSortDirection);
    ordered = this.sortRequests(ordered, this.orderedSortColumn, this.orderedSortDirection);
    
    this.filteredSnackRequests = pending;
    this.filteredOrderedRequests = ordered;
    this.filteredKeepOnHand = keepHand;
  }

  sortRequests(requests: SnackRequest[], column: string, direction: 'asc' | 'desc'): SnackRequest[] {
    return requests.sort((a, b) => {
      let aVal: any = (a as any)[column];
      let bVal: any = (b as any)[column];
      
      if (column.includes('_at')) {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onDateFilterChange() {
    this.applyFilters();
  }

  sortBy(column: string, table: 'pending' | 'ordered') {
    if (table === 'pending') {
      if (this.pendingSortColumn === column) {
        this.pendingSortDirection = this.pendingSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.pendingSortColumn = column;
        this.pendingSortDirection = 'asc';
      }
    } else {
      if (this.orderedSortColumn === column) {
        this.orderedSortDirection = this.orderedSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.orderedSortColumn = column;
        this.orderedSortDirection = 'asc';
      }
    }
    this.applyFilters();
  }

  // Bulk actions
  toggleSelectAll() {
    this.selectAllPending = !this.selectAllPending;
    if (this.selectAllPending) {
      this.filteredSnackRequests.forEach(r => {
        if (r.id) this.selectedPending.add(r.id);
      });
    } else {
      this.selectedPending.clear();
    }
  }

  toggleSelect(id: number | undefined) {
    if (!id) return;
    if (this.selectedPending.has(id)) {
      this.selectedPending.delete(id);
    } else {
      this.selectedPending.add(id);
    }
    this.selectAllPending = this.selectedPending.size === this.filteredSnackRequests.length;
  }

  bulkMarkAsOrdered() {
    if (this.selectedPending.size === 0) return;
    
    if (!confirm(`Mark ${this.selectedPending.size} requests as ordered?`)) return;
    
    const ids = Array.from(this.selectedPending);
    let completed = 0;
    
    ids.forEach(id => {
      const request = this.snackRequests.find(r => r.id === id);
      if (request) {
        this.snackRequestService.updateRequestStatus(id, true).subscribe({
          next: () => {
            completed++;
            if (completed === ids.length) {
              this.selectedPending.clear();
              this.selectAllPending = false;
              this.loadData();
            }
          },
          error: (err) => console.error('Error updating request:', err)
        });
      }
    });
  }

  bulkDelete() {
    if (this.selectedPending.size === 0) return;
    
    if (!confirm(`Delete ${this.selectedPending.size} requests?`)) return;
    
    const ids = Array.from(this.selectedPending);
    let completed = 0;
    
    ids.forEach(id => {
      this.snackRequestService.deleteRequest(id).subscribe({
        next: () => {
          completed++;
          if (completed === ids.length) {
            this.selectedPending.clear();
            this.selectAllPending = false;
            this.loadData();
          }
        },
        error: (err) => console.error('Error deleting request:', err)
      });
    });
  }

  // Export
  exportToCsv(type: 'pending' | 'ordered' | 'keepOnHand') {
    let data: SnackRequest[] = [];
    let filename = '';
    
    if (type === 'pending') {
      data = this.filteredSnackRequests;
      filename = 'pending_requests.csv';
    } else if (type === 'ordered') {
      data = this.filteredOrderedRequests;
      filename = 'ordered_requests.csv';
    } else {
      data = this.filteredKeepOnHand;
      filename = 'keep_on_hand.csv';
    }
    
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = ['Name', 'Snack', 'Drink', 'Misc', 'Link', 'Date Requested', 'Date Ordered'];
    const rows = data.map(r => [
      r.user_name || '',
      r.snack || '',
      r.drink || '',
      r.misc || '',
      r.link || '',
      r.created_at || '',
      r.ordered_at || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  markAsOrdered(request: SnackRequest) {
    if (request.id !== undefined) {
      this.snackRequestService.updateRequestStatus(request.id, true).subscribe({
        next: () => {
          this.undoStack.push({request: {...request}, action: 'ordered'});
          if (this.undoStack.length > 10) this.undoStack.shift();
          this.loadData();
        },
        error: (error) => {
          console.error('Error updating request:', error);
          alert('Failed to mark as ordered');
        }
      });
    }
  }

  markKeepOnHand(request: SnackRequest) {
    if (request.keep_on_hand === 1) return;
  
    this.snackRequestService.updateKeepOnHandStatus(request.id!, true).subscribe({
      next: () => {
        this.loadData();
      },
      error: (error) => {
        console.error('Error updating keep on hand status:', error);
        alert('Failed to mark as keep on hand');
      }
    });
  }

  markNotKeepOnHand(request: SnackRequest) {
    this.snackRequestService.updateKeepOnHandStatus(request.id!, false).subscribe({
      next: () => {
        this.loadData();
      },
      error: (error) => {
        console.error('Error updating keep on hand status:', error);
        alert('Failed to remove from keep on hand');
      }
    });
  }

  deleteRequest(request: SnackRequest) {
    if (confirm('Are you sure you want to delete this request?')) { 
      this.snackRequestService.deleteRequest(request.id!).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error) => {
          console.error('Error deleting request:', error);
          alert('Failed to delete request');
        }
      });
    }
  }

  undo() {
    const lastAction = this.undoStack.pop();
    if (!lastAction) return;
    
    if (lastAction.action === 'ordered' && lastAction.request.id) {
      this.snackRequestService.updateRequestStatus(lastAction.request.id, false).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error('Error undoing action:', err);
          alert('Failed to undo action');
        }
      });
    }
  }

  getSortIcon(column: string, table: 'pending' | 'ordered'): string {
    const sortColumn = table === 'pending' ? this.pendingSortColumn : this.orderedSortColumn;
    const sortDirection = table === 'pending' ? this.pendingSortDirection : this.orderedSortDirection;
    
    if (sortColumn !== column) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  }

  isOlderThan(date: string | undefined, days: number): boolean {
    if (!date) return false;
    const requestDate = new Date(date);
    const now = new Date();
    const diffDays = (now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > days;
  }

  // User Management Methods
  loadUsers() {
    this.loading = true;
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  editUser(user: User) {
    this.editingUser = { ...user };
  }

  saveUser() {
    if (!this.editingUser) return;
    
    this.authService.updateUser(this.editingUser.id!, {
      name: this.editingUser.name!,
      role: this.editingUser.role!
    }).subscribe({
      next: () => {
        this.editingUser = null;
        this.loadUsers();
        alert('User updated successfully');
      },
      error: (err) => {
        console.error('Error updating user:', err);
        alert('Failed to update user');
      }
    });
  }

  cancelEdit() {
    this.editingUser = null;
  }

  promptResetPassword(user: User) {
    this.resettingPasswordUser = user;
    this.newPassword = '';
  }

  resetPassword() {
    if (!this.resettingPasswordUser || !this.newPassword) return;
    
    if (this.newPassword.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }

    this.authService.resetUserPassword(this.resettingPasswordUser.id!, this.newPassword).subscribe({
      next: () => {
        alert(`Password reset successfully for ${this.resettingPasswordUser!.name}`);
        this.resettingPasswordUser = null;
        this.newPassword = '';
      },
      error: (err) => {
        console.error('Error resetting password:', err);
        alert('Failed to reset password');
      }
    });
  }

  cancelResetPassword() {
    this.resettingPasswordUser = null;
    this.newPassword = '';
  }

  deleteUserConfirm(user: User) {
    if (confirm(`Are you sure you want to delete user "${user.name}"? This will also delete all their snack requests.`)) {
      this.authService.deleteUser(user.id!).subscribe({
        next: () => {
          this.loadUsers();
          alert('User deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user');
        }
      });
    }
  }
}
