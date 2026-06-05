import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Slider, CreateSliderDto, Category, CreateCategoryDto, Service, CreateServiceDto, TechnicalService, CreateTechnicalServiceDto, UpdateTechnicalServiceDto, Message, Setting, BlogPost, CreateBlogPostDto, Reference, CreateReferenceDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private url  = environment.apiUrl;

  getSliders()                                             { return this.http.get<Slider[]>(`${this.url}/slider`); }
  getSlidersAdmin()                                        { return this.http.get<Slider[]>(`${this.url}/slider/admin`); }
  createSlider(dto: CreateSliderDto)                       { return this.http.post<number>(`${this.url}/slider`, dto); }
  updateSlider(id: number, dto: any)                       { return this.http.put(`${this.url}/slider/${id}`, dto); }
  deleteSlider(id: number)                                 { return this.http.delete(`${this.url}/slider/${id}`); }

  getCategories()                                          { return this.http.get<Category[]>(`${this.url}/category`); }
  getCategoriesAdmin()                                     { return this.http.get<Category[]>(`${this.url}/category/admin`); }
  createCategory(dto: CreateCategoryDto)                   { return this.http.post<number>(`${this.url}/category`, dto); }
  updateCategory(id: number, dto: any)                     { return this.http.put(`${this.url}/category/${id}`, dto); }
  deleteCategory(id: number)                               { return this.http.delete(`${this.url}/category/${id}`); }

  getServices()                                            { return this.http.get<Service[]>(`${this.url}/service`); }
  getServicesAdmin()                                       { return this.http.get<Service[]>(`${this.url}/service/admin`); }
  getServiceBySlug(slug: string)                           { return this.http.get<Service>(`${this.url}/service/${slug}`); }
  createService(dto: CreateServiceDto)                     { return this.http.post<number>(`${this.url}/service`, dto); }
  updateService(id: number, dto: any)                      { return this.http.put(`${this.url}/service/${id}`, dto); }
  deleteService(id: number)                                { return this.http.delete(`${this.url}/service/${id}`); }

  getTechnicalServices()                                   { return this.http.get<TechnicalService[]>(`${this.url}/technicalservice`); }
  createTechnicalService(dto: CreateTechnicalServiceDto)   { return this.http.post<{serviceCode:string}>(`${this.url}/technicalservice`, dto); }
  updateTechnicalService(id: number, dto: UpdateTechnicalServiceDto) { return this.http.put(`${this.url}/technicalservice/${id}`, dto); }
  queryServiceStatus(code: string)                         { return this.http.get<any>(`${this.url}/technicalservice/status/${code}`); }

  getMessages()                                            { return this.http.get<Message[]>(`${this.url}/message`); }
  markMessageRead(id: number)                              { return this.http.patch(`${this.url}/message/${id}/read`, {}); }
  deleteMessage(id: number)                                { return this.http.delete(`${this.url}/message/${id}`); }
  sendMessage(dto: any)                                    { return this.http.post(`${this.url}/message`, dto); }

  getSetting()                                             { return this.http.get<Setting>(`${this.url}/setting`); }
  updateSetting(dto: any)                                  { return this.http.put(`${this.url}/setting`, dto); }

  getBlogPostsAdmin()                                      { return this.http.get<BlogPost[]>(`${this.url}/blogpost/admin`); }
  getBlogPosts()                                           { return this.http.get<BlogPost[]>(`${this.url}/blogpost`); }
  getBlogPostBySlug(slug: string)                          { return this.http.get<BlogPost>(`${this.url}/blogpost/${slug}`); }
  createBlogPost(dto: CreateBlogPostDto)                   { return this.http.post<number>(`${this.url}/blogpost`, dto); }
  updateBlogPost(id: number, dto: any)                     { return this.http.put(`${this.url}/blogpost/${id}`, dto); }
  deleteBlogPost(id: number)                               { return this.http.delete(`${this.url}/blogpost/${id}`); }

  getReferences()                                          { return this.http.get<Reference[]>(`${this.url}/reference`); }
  getReferencesAdmin()                                     { return this.http.get<Reference[]>(`${this.url}/reference/admin`); }
  createReference(dto: CreateReferenceDto)                 { return this.http.post<number>(`${this.url}/reference`, dto); }
  updateReference(id: number, dto: any)                    { return this.http.put(`${this.url}/reference/${id}`, dto); }
  deleteReference(id: number)                              { return this.http.delete(`${this.url}/reference/${id}`); }

  uploadImage(file: File, type: 'slider' | 'service' | 'blog' | 'reference' | 'logo' | 'favicon') {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.url}/upload/${type}`, form);
  }
}
