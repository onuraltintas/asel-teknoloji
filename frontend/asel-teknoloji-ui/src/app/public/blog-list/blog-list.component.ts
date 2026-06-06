import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { BlogPost } from '../../core/models/models';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-list.component.html'
})
export class BlogListComponent implements OnInit {
  private api      = inject(ApiService);
  private titleSvc = inject(Title);
  private metaSvc  = inject(Meta);
  private jsonLd   = inject(JsonLdService);
  private cdr      = inject(ChangeDetectorRef);

  posts: BlogPost[] = [];
  loading = true;

  ngOnInit() {
    this.titleSvc.setTitle('Blog | Asel Teknoloji');
    this.metaSvc.updateTag({ name: 'description', content: 'Asel Teknoloji blog yazıları: güvenlik kamera, yangın alarm, teknik servis ve bilişim teknolojileri hakkında haberler ve ipuçları.' });

    this.jsonLd.set({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': 'Blog | Asel Teknoloji',
      'description': 'Asel Teknoloji blog yazıları: güvenlik kamera, yangın alarm, teknik servis ve bilişim teknolojileri hakkında haberler ve ipuçları.',
      'url': 'https://aselteknoloji.com/blog',
      'publisher': {
        '@type': 'Organization',
        'name': 'Asel Teknoloji',
        'url': 'https://aselteknoloji.com'
      }
    });

    this.api.getBlogPosts().subscribe({
      next:  posts => { this.posts = posts; this.loading = false; this.cdr.markForCheck(); },
      error: ()    => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
