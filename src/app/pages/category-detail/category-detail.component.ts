import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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

      this.categoriesSubscription = this.categoryService.categories$.subscribe({
        next: (categories) => {
          const foundCategory = categories.find(c => c.id === categoryId);
          if (foundCategory) {
            this.category = foundCategory;
            this.loading = false;
          } else {
            this.errorMessage = 'Category not found';
            this.loading = false;
          }
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
