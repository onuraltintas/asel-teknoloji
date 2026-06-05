import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Site Ayarları</h2>
      <div class="card max-w-2xl">
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="grid grid-cols-2 gap-4">
            @for (field of fields; track field.key) {
              <div [class.col-span-2]="field.full">
                <label class="label">{{ field.label }}</label>
                @if (field.textarea) {
                  <textarea [formControlName]="field.key" class="input" rows="3"></textarea>
                } @else {
                  <input [formControlName]="field.key" [type]="field.type || 'text'" class="input" />
                }
              </div>
            }
          </div>
          <div class="mt-6 flex items-center gap-3">
            <button type="submit" class="btn-primary">Kaydet</button>
            @if (saved) { <span class="text-green-600 text-sm">✓ Kaydedildi</span> }
          </div>
        </form>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private api = inject(ApiService);
  private fb  = inject(FormBuilder);
  saved = false;
  fields = [
    { key:'title',         label:'Site Başlığı',              full:true },
    { key:'description',   label:'Açıklama',                  full:true, textarea:true },
    { key:'keywords',      label:'Anahtar Kelimeler',          full:true },
    { key:'phone',         label:'Telefon' },
    { key:'email',         label:'E-posta', type:'email' },
    { key:'address',       label:'Adres',                     full:true, textarea:true },
    { key:'facebook',      label:'Facebook URL' },
    { key:'instagram',     label:'Instagram URL' },
    { key:'linkedin',      label:'LinkedIn URL' },
    { key:'logoUrl',       label:'Logo URL',                  full:true },
    { key:'faviconUrl',    label:'Favicon URL',               full:true },
    { key:'mapsEmbedCode', label:'Google Maps Embed Kodu',    full:true, textarea:true },
  ];
  form = this.fb.group({ title:[''], description:[''], keywords:[''], phone:[''], email:[''], address:[''], facebook:[''], instagram:[''], linkedin:[''], logoUrl:[''], faviconUrl:[''], mapsEmbedCode:[''] });

  ngOnInit() { this.api.getSetting().subscribe(s => this.form.patchValue(s)); }
  save() {
    this.api.updateSetting(this.form.value).subscribe(() => {
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    });
  }
}
