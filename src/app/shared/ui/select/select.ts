import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Select {
  id = input.required<string>();
  label = input<string>('');
  value = input<string>('');
  options = input.required<SelectOption[]>();
  disabled = input(false);
  error = input('');

  valueChange = output<string>();

  hasError = computed(() => this.error().trim().length > 0);
  errorId = computed(() => `${this.id()}-error`);

  onChange(event: Event): void {
    const element = event.target as HTMLSelectElement;
    this.valueChange.emit(element.value);
  }
}
