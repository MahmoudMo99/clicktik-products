import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-products',
  imports: [],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {}
