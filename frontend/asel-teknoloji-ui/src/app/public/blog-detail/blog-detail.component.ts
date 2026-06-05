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
  template: `
    @if (loading) {
      <div class="flex items-center justify-center py-40">
        <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    } @else if (!post) {
      <div class="max-w-3xl mx-auto px-4 py-32 text-center">
        <div class="text-6xl mb-6">🔍</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-3">Yazı Bulunamadı</h2>
        <p class="text-gray-500 mb-8">Aradığınız blog yazısı mevcut değil veya kaldırılmış olabilir.</p>
        <a routerLink="/blog"
           class="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-semibold transition-colors inline-block">
          Blog'a Dön
        </a>
      </div>
    } @else {

      <!-- Hero -->
      <div class="relative bg-blue-900 text-white overflow-hidden" style="min-height:300px">
        @if (post.imageUrl) {
          <img [src]="post.imageUrl" [alt]="post.title"
               class="absolute inset-0 w-full h-full object-cover opacity-25"
               onerror="this.style.display='none'" />
        }
        <div class="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/70"></div>
        <div class="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 flex flex-col justify-end" style="min-height:300px">

          <!-- Breadcrumb -->
          <nav class="flex items-center gap-2 text-blue-300 text-sm mb-5">
            <a routerLink="/" class="hover:text-white transition-colors">Ana Sayfa</a>
            <span>/</span>
            <a routerLink="/blog" class="hover:text-white transition-colors">Blog</a>
            <span>/</span>
            <span class="text-white font-medium line-clamp-1">{{ post.title }}</span>
          </nav>

          <p class="text-blue-300 text-sm mb-3">{{ formatDate(post.createdAt) }}</p>
          <h1 class="text-3xl md:text-4xl font-extrabold leading-tight max-w-3xl">{{ post.title }}</h1>
        </div>
      </div>

      <!-- Article body -->
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">

          <!-- Content -->
          <article class="lg:col-span-2">
            @if (post.imageUrl) {
              <img [src]="post.imageUrl" [alt]="post.title"
                   class="w-full rounded-2xl object-cover mb-8 shadow-md"
                   style="max-height:420px"
                   onerror="this.style.display='none'" />
            }
            <div class="prose max-w-none text-gray-700 leading-relaxed
                        [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-4
                        [&_h3]:text-xl  [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-3
                        [&_p]:mb-5 [&_ul]:mb-4 [&_ul]:pl-6 [&_li]:mb-2 [&_li]:list-disc
                        [&_ol]:mb-4 [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-orange-400
                        [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500
                        [&_strong]:text-gray-900 [&_a]:text-blue-600 [&_a]:underline
                        [&_img]:rounded-xl [&_img]:my-6"
                 [innerHTML]="post.content">
            </div>

            <!-- Back link -->
            <div class="mt-12 pt-8 border-t border-gray-200">
              <a routerLink="/blog"
                 class="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold transition-colors">
                ← Blog'a Dön
              </a>
            </div>
          </article>

          <!-- Sidebar -->
          <aside class="space-y-6">
            <div class="bg-blue-900 text-white rounded-2xl p-7 text-center sticky top-24">
              <div class="text-4xl mb-4">💬</div>
              <h3 class="font-bold text-xl mb-2">Bilgi Almak İster misiniz?</h3>
              <p class="text-blue-200 text-sm mb-6 leading-relaxed">
                Hizmetlerimiz hakkında detaylı bilgi ve fiyat teklifi için bize ulaşın.
              </p>
              <a routerLink="/iletisim"
                 class="block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                İletişime Geç
              </a>
            </div>

            @if (recentPosts.length > 0) {
              <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <h3 class="font-bold text-gray-900 mb-4">Son Yazılar</h3>
                <ul class="space-y-4">
                  @for (p of recentPosts; track p.id) {
                    <li>
                      <a [routerLink]="['/blog', p.slug]"
                         class="flex gap-3 group">
                        @if (p.imageUrl) {
                          <img [src]="p.imageUrl" [alt]="p.title"
                               class="w-16 h-16 rounded-lg object-cover shrink-0"
                               loading="lazy" onerror="this.style.display='none'" />
                        }
                        <div>
                          <p class="text-xs text-gray-400 mb-1">{{ formatDate(p.createdAt) }}</p>
                          <p class="text-sm font-semibold text-gray-800 group-hover:text-blue-700
                                    transition-colors line-clamp-2">{{ p.title }}</p>
                        </div>
                      </a>
                    </li>
                  }
                </ul>
              </div>
            }
          </aside>

        </div>
      </div>
    }
  `
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
