import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class JsonLdService {
  private doc = inject(DOCUMENT);

  set(schema: Record<string, unknown>): void {
    let el = this.doc.head.querySelector<HTMLScriptElement>('script#ld-json');
    if (!el) {
      el = this.doc.createElement('script');
      el.type = 'application/ld+json';
      el.id = 'ld-json';
      this.doc.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);
  }

  remove(): void {
    this.doc.head.querySelector('script#ld-json')?.remove();
  }
}
