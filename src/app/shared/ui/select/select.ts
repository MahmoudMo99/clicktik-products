import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-select',
  templateUrl: './select.html',
  styleUrl: './select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Select {
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly value = input<string>('');
  readonly options = input.required<SelectOption[]>();
  readonly disabled = input(false);
  readonly error = input('');

  readonly valueChange = output<string>();

  readonly hasError = computed(() => this.error().trim().length > 0);
  readonly errorId = computed(() => `${this.id()}-error`);

  onChange(event: Event): void {
    const element = event.target as HTMLSelectElement;
    this.valueChange.emit(element.value);
  }
}
