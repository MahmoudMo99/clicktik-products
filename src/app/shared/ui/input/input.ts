import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

type InputType = 'text' | 'email' | 'password' | 'search';

@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Input {
  id = input.required<string>();
  label = input<string>('');
  type = input<InputType>('text');
  value = input<string>('');
  placeholder = input<string>('');
  error = input<string>('');
  disabled = input<boolean>(false);

  valueChange = output<string>();

  hasError = computed(() => this.error().trim().length > 0);

  errorId = computed(() => `${this.id()}-error`);

  onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.valueChange.emit(element.value);
  }
}
