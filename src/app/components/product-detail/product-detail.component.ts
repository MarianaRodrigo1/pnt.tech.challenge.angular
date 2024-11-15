import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct(id);
  }

  loadProduct(id: number) {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (data: any) => {
        this.product = data;
      },
      error: (err: any) => {
        this.error = err.message;
        if (this.error) {
          this.snackBar.open(this.error, 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  deleteProduct() {
    if (this.product) {
      this.productService.deleteProduct(this.product.id).subscribe({
        next: () => {
          this.snackBar.open('O produto foi eliminado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/products']);
        },
        error: (err: any) => {
          this.snackBar.open(err.message, 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
