import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Listing } from './page/listing/listing';
import { Lpo } from './page/lpo/lpo';

const routes: Routes = [
  { path: '', redirectTo: 'listing', pathMatch: 'full' },
  { path: 'listing', component: Listing },
  { path: 'create', component: Lpo }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LpoRoutingModule {}