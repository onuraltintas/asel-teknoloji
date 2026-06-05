using AselTeknoloji.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AselTeknoloji.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Slider> Sliders => Set<Slider>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<TechnicalService> TechnicalServices => Set<TechnicalService>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Setting> Settings => Set<Setting>();
    public DbSet<Reference> References => Set<Reference>();
    public DbSet<Feature> Features => Set<Feature>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.HasIndex(x => x.Username).IsUnique();
            e.Property(x => x.Username).HasMaxLength(100).IsRequired();
            e.Property(x => x.Email).HasMaxLength(200).IsRequired();
            e.Property(x => x.PasswordHash).IsRequired();
        });

        // Slider
        modelBuilder.Entity<Slider>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.ImageUrl).IsRequired();
        });

        // Category
        modelBuilder.Entity<Category>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Name).HasMaxLength(150).IsRequired();
            e.Property(x => x.Slug).HasMaxLength(150).IsRequired();
        });

        // Service
        modelBuilder.Entity<Service>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Title).HasMaxLength(300).IsRequired();
            e.Property(x => x.Slug).HasMaxLength(300).IsRequired();
            e.Property(x => x.MetaTitle).HasMaxLength(70);
            e.Property(x => x.MetaDescription).HasMaxLength(160);
            e.HasOne(x => x.Category)
             .WithMany(c => c.Services)
             .HasForeignKey(x => x.CategoryId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // TechnicalService
        modelBuilder.Entity<TechnicalService>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.ServiceCode).IsUnique();
            e.Property(x => x.ServiceCode).HasMaxLength(20).IsRequired();
            e.Property(x => x.CustomerName).HasMaxLength(200).IsRequired();
            e.Property(x => x.CustomerPhone).HasMaxLength(20).IsRequired();
            e.Property(x => x.DeviceType).HasMaxLength(100).IsRequired();
            e.Property(x => x.Status).HasConversion<int>();
        });

        // BlogPost
        modelBuilder.Entity<BlogPost>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Title).HasMaxLength(300).IsRequired();
            e.Property(x => x.Slug).HasMaxLength(300).IsRequired();
        });

        // Message
        modelBuilder.Entity<Message>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.FullName).HasMaxLength(200).IsRequired();
            e.Property(x => x.Email).HasMaxLength(200).IsRequired();
            e.Property(x => x.Subject).HasMaxLength(300).IsRequired();
        });

        // Setting – tek satır, Id=1 olacak
        modelBuilder.Entity<Setting>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
        });

        // Reference
        modelBuilder.Entity<Reference>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(500);
            e.Property(x => x.Website).HasMaxLength(300);
        });

        // Feature
        modelBuilder.Entity<Feature>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Icon).HasMaxLength(20).IsRequired();
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(500).IsRequired();
        });
    }
}
