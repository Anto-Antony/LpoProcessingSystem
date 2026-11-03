import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { LpoService } from '../../services/lpo';
import { LpoAmountTotals, LpoModel } from '../../models/lpo.model';
import { LpoDtls } from './lpo-dtls/lpo-dtls';
@Component({
  standalone: true,
  selector: 'app-lpo',
  imports: [CommonModule, FormsModule, RouterLink, LpoDtls],
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
      .subscribe((params) => {
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
  getExchangeRate(exchangeRate: number | null): void {
    const currentLpo = this.lpo();
    if (!currentLpo) {
      return;
    }
    const rate = exchangeRate !== null && Number.isFinite(exchangeRate)
      ? Math.max(0, exchangeRate)
      : 0;

    this.lpo.set({ ...currentLpo, lpO_CURR_RATE: rate });
  }
  syncLpoTotals(totals: LpoAmountTotals): void {
    const currentLpo = this.lpo();
    if (!currentLpo) {
      return;
    }
    this.lpo.set({
      ...currentLpo,
      lpO_FC_AMT: totals.foreignCurrencyAmount,
      lpO_LC_AMT: totals.localCurrencyAmount
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
          this.lpo.set(data);
        },
        error: () => {
          this.errorMessage.set(
            'Unable to load the LPO record. Please check the API connection.'
          );
        }
      });
  }
}
