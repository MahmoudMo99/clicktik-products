import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
type ButtonType = 'button' | 'submit' | 'reset';
type ButtonRadius = 'sm' | 'md';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<ButtonType>('button');
  radius = input<ButtonRadius>('md');

  disabled = input(false);
  loading = input(false);
  fullWidth = input(false);

  clicked = output<MouseEvent>();

  buttonClasses = computed(() =>
    [
      'button',
      `button-${this.variant()}`,
      `button-${this.size()}`,
      `button-radius-${this.radius()}`,
      this.fullWidth() ? 'button-full' : '',
      this.loading() ? 'button-loading' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  isDisabled = computed(() => this.disabled() || this.loading());

  onClick(event: MouseEvent): void {
    if (this.isDisabled()) {
      event.preventDefault();
      return;
    }

    this.clicked.emit(event);
  }
}
