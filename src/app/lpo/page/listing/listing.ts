import { CommonModule } from '@angular/common';
import { Component, afterNextRender, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LpoService } from '../../services/lpo';
import type { LpoModel } from '../../models/lpo.model';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listing.html',
  styleUrl: './listing.scss'
})
export class Listing  {
  lpos = signal<LpoModel[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  constructor(private readonly lpoService: LpoService) {
  afterNextRender(() => this.loadLpos());
}
  loadLpos(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.lpoService.getAllLpo().subscribe({
      next: (response) => {
        this.loading.set(false);
        if (!response.success) {
          this.lpos.set([]);
          this.errorMessage.set(`Unable to load LPO records. Error: ${response.errorCode}`
          );
          return;
        }
        this.lpos.set(response.data ?? []);
      },

      error: (error) => {
        console.error('Error fetching LPO records:', error);
        this.loading.set(false);
        this.errorMessage.set('Unable to load LPO records. Check the API connection and CORS settings.'
        );
      }
    });
  }
}
