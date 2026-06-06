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
  loading  = true;
  page     = 1;
  pageSize = 9;

  get paged()      { return this.posts.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get totalPages() { return Math.ceil(this.posts.length / this.pageSize); }
  get pageEnd()    { return Math.min(this.page * this.pageSize, this.posts.length); }
  get pageNumbers() {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total, this.page, this.page - 1, this.page + 1].filter(p => p >= 1 && p <= total));
    return [...pages].sort((a, b) => a - b);
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
  }

  ngOnInit() {
    this.titleSvc.setTitle('Blog | Asel Teknoloji');
    this.metaSvc.updateTag({ name: 'description', content: 'Asel Teknoloji blog yazıları: güvenlik kamera, yangın alarm, teknik servis ve bilişim teknolojileri hakkında haberler ve ipuçları.' });

    this.jsonLd.set({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': 'Blog | Asel Teknoloji',
      'description': 'Asel Teknoloji blog yazıları.',
      'url': 'https://aselteknoloji.com/blog',
      'publisher': { '@type': 'Organization', 'name': 'Asel Teknoloji', 'url': 'https://aselteknoloji.com' }
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
