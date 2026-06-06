import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html'
})
export class NotFoundComponent {
  constructor() {
    inject(Title).setTitle('Sayfa Bulunamadı | Asel Teknoloji');
  }
}
