import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retryWhen, delay, scan, tap } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl + '/api';
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders()
      .set('Content-Type', '*')
      .set('Accept', '*/*')
      .set('apiKey', this.apiKey);

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Get all products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/Products`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get product by ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/Products/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Create a new product
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/Products`, product, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Update an existing product
  updateProduct(id: number, product: Product): Observable<any> {
    return this.http.put(`${this.apiUrl}/Products/${id}`, product, {
      headers: this.getHeaders(),
      observe: 'response', 
      responseType: 'text' 
    }).pipe(
      tap((response) => {
        if (response.status === 200 || response.status === 204) {
          const responseBody = response.body;
          console.log('Mensagem do servidor:', responseBody);
        }
      }),
      catchError(this.handleError)
    );
  }
  // Delete a product
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Products/${id}`, {
      headers: this.getHeaders(),
      observe: 'response',
      responseType: 'text' 
    }).pipe(
      tap((response) => {
        if (response.status === 200 || response.status === 204) {
          const responseBody = response.body;
          console.log('Mensagem do servidor:', responseBody);
        }
      }),
      catchError(this.handleError)
    );
  }
  

  // Handle errors
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Erro do backend
      switch (error.status) {
        case 404:
          errorMessage = 'Error 404: Not Found';
          break;
        case 500:
          errorMessage = 'Error 500: Internal Server Error';
          break;
        default:
          errorMessage = `Server Error: ${error.message}`;
          break;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
