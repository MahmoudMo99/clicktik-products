import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
type ButtonType = 'button' | 'submit' | 'reset';
type ButtonRadius = 'sm' | 'md';

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly radius = input<ButtonRadius>('md');

  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);

  readonly clicked = output<MouseEvent>();

  readonly buttonClasses = computed(() =>
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

  readonly isDisabled = computed(() => this.disabled() || this.loading());

  onClick(event: MouseEvent): void {
    if (this.isDisabled()) {
      event.preventDefault();
      return;
    }

    this.clicked.emit(event);
  }
}
