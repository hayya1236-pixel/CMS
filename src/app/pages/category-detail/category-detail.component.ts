import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, timeout } from 'rxjs/operators';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { Category } from '../../models/category.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.css'],
  standalone: false
})
export class CategoryDetailComponent implements OnInit, OnDestroy {
  category: Category | null = null;
  loading: boolean = true;
  errorMessage: string = '';
  categoryProducts: Product[] = [];
  loadingProducts: boolean = false;
  showProductsModal: boolean = false;
  private categoriesSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private productsSubscription?: Subscription;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategory();
  }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
    this.productsSubscription?.unsubscribe();
  }

  loadCategory(): void {
    this.loading = true;
    this.errorMessage = '';

    this.routeSubscription = this.route.params.subscribe(params => {
      const categoryId = parseInt(params['id'], 10);

      this.categoriesSubscription = this.categoryService.categories$.pipe(
        filter(categories => categories.length > 0 || this.loading === false),
        timeout(5000)
      ).subscribe({
        next: (categories) => {
          const foundCategory = categories.find(c => c.id === categoryId);
          if (foundCategory) {
            this.category = foundCategory;
            this.loading = false;
          } else if (categories.length > 0) {
            // We have categories but this one isn't in the list
            this.errorMessage = 'Category not found';
            this.loading = false;
          }
          // Keep waiting if categories list is still empty
        },
        error: (err) => {
          console.error('Failed to load category:', err);
          this.errorMessage = 'Failed to load category details';
          this.loading = false;
        }
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/categories']);
  }

  viewProductsInCategory(): void {
    if (!this.category) {
      console.warn('Category is not loaded yet');
      return;
    }

    this.showProductsModal = true;
    this.loadingProducts = true;
    this.categoryProducts = [];

    // Get the current products immediately if available
    this.productService.products$.pipe(
      timeout(5000)
    ).subscribe({
      next: (products) => {
        if (products && products.length > 0) {
          this.categoryProducts = products.filter(p => p.categoryId === this.category!.id);
        }
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.loadingProducts = false;
        this.categoryProducts = [];
      }
    });
  }

  closeProductsModal(): void {
    this.showProductsModal = false;
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
