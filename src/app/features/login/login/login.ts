import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

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
  username = signal('');
  password = signal('');

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    console.log({
      username: this.username(),
      password: this.password(),
    });
  }
}
