import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { Button } from '../../../shared/ui/button/button';
import { Input } from '../../../shared/ui/input/input';

@Component({
  selector: 'app-login',
  imports: [Button, Input],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  username = signal('');
  password = signal('');
  submitted = signal(false);
  loading = signal(false);
  errorMessage = signal('');

  usernameError = computed(() =>
    this.submitted() && !this.username().trim() ? 'Username is required' : '',
  );

  passwordError = computed(() =>
    this.submitted() && !this.password() ? 'Password is required' : '',
  );

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.usernameError() || this.passwordError()) {
      return;
    }

    this.loading.set(true);

    this.authService
      .login({
        username: this.username().trim(),
        password: this.password(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/products']);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getLoginErrorMessage(error));
        },
      });
  }

  private getLoginErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 400) {
      return 'Invalid username or password.';
    }
    return 'Something went wrong. Please try again.';
  }
}
