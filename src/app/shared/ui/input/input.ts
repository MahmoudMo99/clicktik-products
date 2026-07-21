import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

type InputType = 'text' | 'email' | 'password' | 'search';

@Component({
  selector: 'app-input',
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Input {
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly type = input<InputType>('text');
  readonly value = input<string>('');
  readonly placeholder = input<string>('');
  readonly error = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly autocomplete = input<string>('');

  readonly valueChange = output<string>();

  readonly hasError = computed(() => this.error().trim().length > 0);

  readonly errorId = computed(() => `${this.id()}-error`);

  onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.valueChange.emit(element.value);
  }
}
