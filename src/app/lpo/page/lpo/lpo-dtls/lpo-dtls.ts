import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Dropdown } from '../../../../shared/dropdown/dropdown';
import { LpoService } from '../../../services/lpo';
import { LpoAmountTotals } from '../../../models/lpo.model';
import { LpoDtlsModel } from '../../../models/lpo-dtls.model';

@Component({
  standalone: true,
  selector: 'app-lpo-dtls',
  imports: [CommonModule, FormsModule, Dropdown],
  templateUrl: './lpo-dtls.html',
  styleUrl: './lpo-dtls.scss'
})
export class LpoDtls implements OnChanges {
  @Input({ required: true }) lpoId!: number;
  @Input() exchangeRate = 0;
  @Output() readonly totalsChange = new EventEmitter<LpoAmountTotals>();

  readonly lpoDtls = signal<LpoDtlsModel[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly editingItemUids = signal<Set<number>>(new Set());

  private nextDraftUid = -1;

  constructor(private readonly lpoService: LpoService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lpoId'] && this.lpoId) {
      this.loadLpoDtls(String(this.lpoId));
      return;
    }
    if (changes['exchangeRate'] && !changes['exchangeRate'].firstChange && this.lpoDtls().length > 0
    ) {
      this.recalculateLocalAmountsFromForeign();
    }
  }

  isEditing(item: LpoDtlsModel): boolean {
    return this.editingItemUids().has(item.lpoD_UID);
  }

  addItem(): void {
    const draft: LpoDtlsModel = {
      lpoD_UID: this.nextDraftUid--,
      lpoD_LPO_UID: this.lpoId,
      lpoD_CURR_RATE: this.exchangeRate,
      lpoD_ITEM_CODE: '',
      lpoD_FC_AMT: 0,
      lpoD_LC_AMT: 0,
      lpoD_CR_BY: '',
      lpoD_CR_DT: new Date().toISOString(),
      lpoD_UP_BY: null,
      lpoD_UP_DT: null
    };

    this.lpoDtls.update((items) => [...items, draft]);
    this.editingItemUids.update((ids) => new Set(ids).add(draft.lpoD_UID));
    this.emitTotals();
  }

  toggleEdit(item: LpoDtlsModel): void {
    this.editingItemUids.update((ids) => {
      const next = new Set(ids);
      if (next.has(item.lpoD_UID)) {
        next.delete(item.lpoD_UID);
      } else {
        next.add(item.lpoD_UID);
      }
      return next;
    });
  }

  deleteItem(item: LpoDtlsModel): void {
    this.lpoDtls.update((items) => items.filter((current) => current !== item));
    this.editingItemUids.update((ids) => {
      const next = new Set(ids);
      next.delete(item.lpoD_UID);
      return next;
    });
    this.emitTotals();
  }
  calculateForeignAmount(rowIndex: number, value: number | null): void {
    const foreignAmount = this.toAmount(value);
    const rate = this.toAmount(this.exchangeRate);
    this.lpoDtls.update((items) => items.map((item, index) =>
      index === rowIndex
        ? {
            ...item,
            lpoD_CURR_RATE: rate,
            lpoD_FC_AMT: foreignAmount,
            lpoD_LC_AMT: this.roundCurrency(foreignAmount * rate)
          }
        : item
    ));
    this.emitTotals();
  }
  calculateLocalAmount(rowIndex: number, value: number | null): void {
    const localAmount = this.toAmount(value);
    const rate = this.toAmount(this.exchangeRate);

    this.lpoDtls.update((items) => items.map((item, index) =>
      index === rowIndex
        ? {
            ...item,
            lpoD_CURR_RATE: rate,
            lpoD_LC_AMT: localAmount,
            lpoD_FC_AMT: rate > 0
              ? this.roundCurrency(localAmount / rate)
              : 0
          }
        : item
    ));
    this.emitTotals();
  }

  private loadLpoDtls(lpoId: string): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.lpoDtls.set([]);
    this.editingItemUids.set(new Set());

    this.lpoService
      .getLpoDtlsById(lpoId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.errorMessage.set(
              `Unable to load LPO items. Error: ${response.errorCode}`
            );
            return;
          }

          if (!Array.isArray(response.data)) {
            this.errorMessage.set(
              'Invalid LPO items response received from the API.'
            );
            return;
          }

          this.lpoDtls.set(response.data);
          this.recalculateLocalAmountsFromForeign();
        },
        error: (error: unknown) => {
          console.error('Error fetching LPO items:', error);
          this.errorMessage.set(
            'Unable to load LPO items. Please check the API connection.'
          );
        }
      });
  }
  private recalculateLocalAmountsFromForeign(): void {
    const rate = this.toAmount(this.exchangeRate);

    this.lpoDtls.update((items) => items.map((item) => ({
      ...item,
      lpoD_CURR_RATE: rate,
      lpoD_LC_AMT: this.roundCurrency(this.toAmount(item.lpoD_FC_AMT) * rate)
    })));
    this.emitTotals();
  }
  private emitTotals(): void {
    const items = this.lpoDtls();
    this.totalsChange.emit({
      foreignCurrencyAmount: this.roundCurrency(
        items.reduce((total, item) => total + this.toAmount(item.lpoD_FC_AMT), 0)
      ),
      localCurrencyAmount: this.roundCurrency(
        items.reduce((total, item) => total + this.toAmount(item.lpoD_LC_AMT), 0)
      )
    });
  }
  private toAmount(value: number | null): number {
    return value !== null && Number.isFinite(value) ? Math.max(0, value) : 0;
  }
  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}