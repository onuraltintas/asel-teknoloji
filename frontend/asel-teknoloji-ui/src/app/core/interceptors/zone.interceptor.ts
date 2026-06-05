import { HttpInterceptorFn } from '@angular/common/http';
import { inject, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

export const zoneInterceptor: HttpInterceptorFn = (req, next) => {
  const zone = inject(NgZone);
  return new Observable(observer => {
    next(req).subscribe({
      next:     v   => zone.run(() => observer.next(v)),
      error:    err => zone.run(() => observer.error(err)),
      complete: ()  => zone.run(() => observer.complete()),
    });
  });
};
