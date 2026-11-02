import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { DropdownModel } from '../models/dropdown-model';
import { CodeMasterService } from '../services/code-master';

@Component({
  standalone: true,
  selector: 'app-dropdown',
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss'
})
export class Dropdown implements OnChanges {
  @Input({ required: true }) cmCode = '';
  @Input() value = '';
  @Input() placeholder = 'Select an option';
  @Input() ariaLabel = 'Select an option';
  @Output() readonly valueChange = new EventEmitter<string>();

  readonly options = signal<DropdownModel[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  constructor(private readonly codeMasterService: CodeMasterService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cmCode'] && this.cmCode.trim()) {
      this.loadOptions(this.cmCode.trim());
    }
  }

  onSelectionChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      this.valueChange.emit(target.value);
    }
  }

  private loadOptions(code: string): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.options.set([]);

    this.codeMasterService
      .getAll(code)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !Array.isArray(response.data)) {
            this.errorMessage.set('Unable to load dropdown options.');
            return;
          }

          this.options.set(
            response.data
              .filter((item) => item.cM_ACTIVE_YN === 'Y')
              .map((item) => ({
                value: item.cM_TYPE,
                label: `${item.cM_TYPE} - ${item.cM_DESC}`
              }))
          );
        },
        error: (error: unknown) => {
          console.error(`Error loading ${code} dropdown options:`, error);
          this.errorMessage.set('Unable to load dropdown options.');
        }
      });
  }
}
