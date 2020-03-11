import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitoringComponent } from './components/monitoring/monitoring.component';


const routes: Routes = [
  { path: 'monitoring', component: MonitoringComponent, },
  { path: '**', redirectTo: '/monitoring' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
