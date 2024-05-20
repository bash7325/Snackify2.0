import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RequestFormComponent } from './request-form/request-form.component';
import { UserResolver } from './user.resolver';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component'; 
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'request', component: RequestFormComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: '/login' }, //404 errors
  { 
    path: 'request', 
    component: RequestFormComponent, 
    resolve: {
      user: UserResolver  // Add the resolver to the route
    } 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
