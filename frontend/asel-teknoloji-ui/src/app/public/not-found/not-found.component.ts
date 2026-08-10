import { Component, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { JsonLdService } from '../../core/services/json-ld.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html'
})
export class NotFoundComponent {
  constructor() {
    inject(Title).setTitle('Sayfa Bulunamadı | Asel Teknoloji');
    inject(Meta).updateTag({ name: 'robots', content: 'noindex, follow' });
    inject(JsonLdService).remove();

    const responseInit = inject(RESPONSE_INIT, { optional: true });
    if (responseInit) {
      responseInit.status = 404;
    }
  }
}
