import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, takeWhile, timeout } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  standalone: false
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  loading: boolean = true;
  errorMessage: string = '';
  private productsSubscription?: Subscription;
  private routeSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProduct();
  }

  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  loadProduct(): void {
    this.loading = true;
    this.errorMessage = '';

    this.routeSubscription = this.route.params.subscribe(params => {
      const productId = parseInt(params['id'], 10);
      let foundProduct = false;
      let attempts = 0;
      const maxAttempts = 50; // Wait up to 5 seconds for data

      const checkForProduct = (products: Product[]) => {
        const product = products.find(p => p.id === productId);
        if (product) {
          this.product = product;
          this.loading = false;
          foundProduct = true;
          return true;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          if (!foundProduct) {
            this.errorMessage = 'Product not found';
            this.loading = false;
          }
          return true;
        }
        return false;
      };

      this.productsSubscription = this.productService.products$.subscribe({
        next: (products) => {
          if (checkForProduct(products)) {
            this.productsSubscription?.unsubscribe();
          }
        },
        error: (err) => {
          console.error('Failed to load product:', err);
          this.errorMessage = 'Failed to load product details';
          this.loading = false;
        }
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  goToCategory(): void {
    if (this.product) {
      this.router.navigate(['/category', this.product.categoryId]);
    }
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

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  }

  getStockStatusClass(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 10) return 'low-stock';
    return 'in-stock';
  }
}
