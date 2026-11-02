import { Routes } from '@angular/router';
import { Lpo } from './lpo/page/lpo/lpo';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'lpo/listing',
    pathMatch: 'full'
  },
  {
    path: 'lpo',
    loadChildren: () =>
      import('./lpo/lpo-module').then(m => m.LpoModule)
  },
  {
    path: 'lpo/:id',
    component: Lpo
  }
];
