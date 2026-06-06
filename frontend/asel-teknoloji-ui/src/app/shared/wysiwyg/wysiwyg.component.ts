import {
  AfterViewInit, Component, ElementRef, OnDestroy, ViewChild,
  forwardRef, inject, PLATFORM_ID
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-wysiwyg',
  standalone: true,
  templateUrl: './wysiwyg.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => WysiwygComponent),
    multi: true
  }]
})
export class WysiwygComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @ViewChild('editor') editorEl!: ElementRef<HTMLElement>;

  private platformId  = inject(PLATFORM_ID);
  private quill: any  = null;
  private pending     = '';
  private onChange    = (_: string) => {};
  private onTouched   = () => {};

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    import('quill').then(({ default: Quill }) => {
      this.quill = new (Quill as any)(this.editorEl.nativeElement, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean']
          ]
        }
      });

      if (this.pending) {
        this.quill.clipboard.dangerouslyPasteHTML(this.pending);
        this.pending = '';
      }

      this.quill.on('text-change', () => {
        const html = this.quill.root.innerHTML;
        this.onChange(html === '<p><br></p>' ? '' : html);
      });

      this.quill.root.addEventListener('blur', () => this.onTouched());
    });
  }

  ngOnDestroy() { this.quill = null; }

  writeValue(value: string) {
    const v = value ?? '';
    if (this.quill) {
      this.quill.clipboard.dangerouslyPasteHTML(v);
    } else {
      this.pending = v;
    }
  }

  registerOnChange(fn: any)  { this.onChange  = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
}
