import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Dropdown } from '../../../../shared/dropdown/dropdown';
import { LpoService } from '../../../services/lpo';
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

  readonly lpoDtls = signal<LpoDtlsModel[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly editingItemUids = signal<Set<number>>(new Set());

  private nextDraftUid = -1;

  constructor(private readonly lpoService: LpoService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lpoId'] && this.lpoId) {
      this.loadLpoDtls(String(this.lpoId));
    }
  }

  isEditing(item: LpoDtlsModel): boolean {
    return this.editingItemUids().has(item.lpoD_UID);
  }

  addItem(): void {
    const draft: LpoDtlsModel = {
      lpoD_UID: this.nextDraftUid--,
      lpoD_LPO_UID: this.lpoId,
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
        },
        error: (error: unknown) => {
          console.error('Error fetching LPO items:', error);
          this.errorMessage.set(
            'Unable to load LPO items. Please check the API connection.'
          );
        }
      });
  }
}
