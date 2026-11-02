
import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { LpoService } from '../../services/lpo';
import { LpoModel } from '../../models/lpo.model';
import { LpoDtls } from './lpo-dtls/lpo-dtls';
@Component({
  standalone: true,
  selector: 'app-lpo',
  imports: [CommonModule, RouterLink, LpoDtls],
  templateUrl: './lpo.html',
  styleUrl: './lpo.scss'
})
export class Lpo implements OnInit {
  readonly lpo = signal<LpoModel | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _lpoService: LpoService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {

    this._route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {

        const lpoId = params.get('id')?.trim();

        if (!lpoId) {
          this.lpo.set(null);
          this.loading.set(false);
          this.errorMessage.set('LPO ID is missing from the URL.');
          return;
        }

        this.loadLpo(lpoId);
      });
  }

  private loadLpo(lpoId: string): void {

    this.loading.set(true);
    this.errorMessage.set('');
    this.lpo.set(null);

    this._lpoService
      .getLpoById(lpoId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({

        next: (response) => {

          if (!response.success) {
            this.errorMessage.set(
              `Unable to load LPO record. Error: ${response.errorCode}`
            );
            return;
          }
          const data = response.data;
          if (
            !data ||
            typeof data !== 'object' ||
            Array.isArray(data) ||
            Object.keys(data).length === 0
          ) {
            this.errorMessage.set('No valid LPO record was returned.');
            return;
          }
          this.lpo.set(data as LpoModel);
        },

        error: () => {
          this.errorMessage.set(
            'Unable to load the LPO record. Please check the API connection.'
          );
        }
      });
  }
}

