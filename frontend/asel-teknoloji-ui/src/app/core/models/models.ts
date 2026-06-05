export interface LoginDto { username: string; password: string; }
export interface LoginResponse { token: string; username: string; expiration: string; }

export interface Slider { id: number; title: string; subTitle: string; imageUrl: string; targetUrl?: string; displayOrder: number; isActive: boolean; }
export interface CreateSliderDto { title: string; subTitle: string; imageUrl: string; targetUrl?: string; displayOrder: number; isActive: boolean; }

export interface Category { id: number; name: string; slug: string; isActive: boolean; }
export interface CreateCategoryDto { name: string; slug: string; isActive: boolean; }

export interface Service { id: number; categoryId: number; categoryName: string; title: string; slug: string; description: string; shortDescription: string; imageUrl?: string; metaTitle?: string; metaDescription?: string; isActive: boolean; }
export interface CreateServiceDto { categoryId: number; title: string; slug: string; description: string; shortDescription: string; imageUrl?: string; metaTitle?: string; metaDescription?: string; isActive: boolean; }

export interface TechnicalService {
  id: number; customerName: string; customerPhone: string; customerEmail?: string;
  deviceType: string; issueDescription: string; serviceCode: string;
  status: number; statusLabel: string; adminNote?: string; createdAt: string; updatedAt?: string;
}
export interface CreateTechnicalServiceDto { customerName: string; customerPhone: string; customerEmail?: string; deviceType: string; issueDescription: string; }
export interface UpdateTechnicalServiceDto { status: number; adminNote?: string; }

export interface Message { id: number; fullName: string; email: string; phone?: string; subject: string; body: string; isRead: boolean; createdAt: string; }
export interface Setting {
  id: number; title: string; description?: string; keywords?: string;
  logoUrl?: string; faviconUrl?: string;
  phone?: string; email?: string; address?: string; mapsEmbedCode?: string;
  facebook?: string; instagram?: string; linkedin?: string;
  whatsapp?: string; youtube?: string; twitter?: string;
  tagline?: string; taglineSubtitle?: string;
  stat1Value?: string; stat1Label?: string;
  stat2Value?: string; stat2Label?: string;
  stat3Value?: string; stat3Label?: string;
  stat4Value?: string; stat4Label?: string;
}

export interface BlogPost { id: number; title: string; slug: string; content: string; imageUrl?: string; isActive: boolean; createdAt: string; updatedAt?: string; }
export interface CreateBlogPostDto { title: string; slug: string; content: string; imageUrl?: string; isActive: boolean; }

export interface Reference { id: number; name: string; description?: string; imageUrl?: string; website?: string; displayOrder: number; isActive: boolean; }
export interface CreateReferenceDto { name: string; description?: string; imageUrl?: string; website?: string; displayOrder: number; isActive: boolean; }

export const SERVICE_STATUS_LABELS: Record<number, string> = {
  0: 'Beklemede', 1: 'İşlemde', 2: 'Parça Bekleniyor', 3: 'Tamamlandı', 4: 'İptal'
};
