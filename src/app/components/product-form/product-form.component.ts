import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  loading = false;
  isEditMode = false;
  productId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0), Validators.max(99999)]]
    });
  }

  ngOnInit() {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productId) {
      this.isEditMode = true;
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: number) {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (data: any) => {
        this.productForm.patchValue(data);
      },
      error: (err: { message: any; }) => {
        this.snackBar.open(err.message, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  onSubmit() {
    if (this.productForm.valid) {
      this.loading = true;
      const productData: Product = {
        id: this.productId,
        ...this.productForm.value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (this.isEditMode && this.productId) {
        this.productService.updateProduct(this.productId, productData).subscribe({
          next: () => {
            this.snackBar.open('Produto atualizado com sucesso', 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/products']);
          },
          error: (err: { message: any; }) => {
            this.snackBar.open(err.message, 'Fechar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.router.navigate(['/products']);
          }
        });
      } else {
        this.productService.createProduct(productData).subscribe({
          next: () => {
            this.snackBar.open('Produto criado com sucesso', 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/products']);
          },
          error: (err: { message: any; }) => {
            this.snackBar.open(err.message, 'Fechar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    }
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}
