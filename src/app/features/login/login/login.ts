import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { getLoginErrorMessage } from '../../../core/auth/auth-errors';
import { LoginCredentials } from '../../../core/auth/auth.models';
import { AuthService } from '../../../core/auth/auth.service';
import { getPostLoginRedirectUrl } from '../../../core/routing/route-utils';
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
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = signal<LoginCredentials>({
    username: '',
    password: '',
  });

  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly usernameError = computed(() =>
    this.submitted() && !this.form().username.trim() ? 'Email is required' : '',
  );

  readonly passwordError = computed(() =>
    this.submitted() && !this.form().password ? 'Password is required' : '',
  );

  readonly isFormInvalid = computed(() => Boolean(this.usernameError() || this.passwordError()));

  updateUsername(username: string): void {
    this.errorMessage.set('');

    this.form.update((form) => ({
      ...form,
      username,
    }));
  }

  updatePassword(password: string): void {
    this.errorMessage.set('');

    this.form.update((form) => ({
      ...form,
      password,
    }));
  }

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    if (this.loading()) {
      return;
    }

    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.isFormInvalid()) {
      return;
    }

    this.loading.set(true);

    this.authService
      .login({
        username: this.form().username.trim(),
        password: this.form().password,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => {
          const returnUrl = getPostLoginRedirectUrl(
            this.route.snapshot.queryParamMap.get('returnUrl'),
          );

          void this.router.navigateByUrl(returnUrl);
        },
        error: (error: unknown) => {
          this.errorMessage.set(getLoginErrorMessage(error));
        },
      });
  }
}
