import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { BlogPost } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-detail.component.html'
})
export class BlogDetailComponent implements OnInit {
  private api      = inject(ApiService);
  private route    = inject(ActivatedRoute);
  private titleSvc = inject(Title);
  private metaSvc  = inject(Meta);
  private jsonLd   = inject(JsonLdService);
  private cdr      = inject(ChangeDetectorRef);

  post: BlogPost | null = null;
  recentPosts: BlogPost[] = [];
  loading = true;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') ?? '';
      this.loading = true;

      this.api.getBlogPostBySlug(slug).subscribe({
        next: p => {
          this.post = p;
          this.loading = false;
          this.titleSvc.setTitle(`${p.title} | Asel Teknoloji`);
          this.metaSvc.updateTag({ name: 'description', content: this.excerpt(p.content) });
          this.metaSvc.updateTag({ property: 'og:title',       content: p.title });
          this.metaSvc.updateTag({ property: 'og:description', content: this.excerpt(p.content) });
          if (p.imageUrl) this.metaSvc.updateTag({ property: 'og:image', content: p.imageUrl });

          const pageUrl = `${environment.siteUrl}/blog/${p.slug}`;
          const excerptText = this.excerpt(p.content);
          this.jsonLd.set({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'BlogPosting',
                'headline': p.title,
                'description': excerptText,
                'url': pageUrl,
                'datePublished': p.createdAt,
                ...(p.updatedAt  && { 'dateModified': p.updatedAt }),
                ...(p.imageUrl   && { 'image': p.imageUrl }),
                'author':    { '@type': 'Organization', 'name': 'Asel Teknoloji', 'url': environment.siteUrl },
                'publisher': { '@type': 'Organization', 'name': 'Asel Teknoloji', 'url': environment.siteUrl }
              },
              {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                  { '@type': 'ListItem', 'position': 1, 'name': 'Ana Sayfa', 'item': environment.siteUrl },
                  { '@type': 'ListItem', 'position': 2, 'name': 'Blog',      'item': `${environment.siteUrl}/blog` },
                  { '@type': 'ListItem', 'position': 3, 'name': p.title,     'item': pageUrl }
                ]
              }
            ]
          });
          this.cdr.markForCheck();
        },
        error: () => { this.post = null; this.loading = false; this.cdr.markForCheck(); }
      });

      this.api.getBlogPosts().subscribe({
        next: all => { this.recentPosts = all.filter(p => p.slug !== slug).slice(0, 4); this.cdr.markForCheck(); },
        error: () => {}
      });
    });
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  private excerpt(html: string, len = 155) {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > len ? text.slice(0, len) + '…' : text;
  }
}
