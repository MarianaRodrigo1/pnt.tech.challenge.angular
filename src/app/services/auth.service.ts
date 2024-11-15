import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

interface AuthResponse {
  token?: string;
  message?: string;
}

interface LoginRequest {
  username: string;
  email: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/api';
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {   }

  private getHeaders(): HttpHeaders {
    
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', '*/*')
      .set('apiKey', this.apiKey)
      .set('Referrer-Policy', 'strict-origin-when-cross-origin')
      .set('Access-Control-Allow-Origin', '*')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Headers', 'Content-Type, apiKey')
  
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/login`, credentials, {
      headers: this.getHeaders()
    }).pipe(
      tap((response: AuthResponse) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }else {
          console.error('Token is undefined');
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/register`, userData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }



  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Erro do backend
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server';
          break;
        case 400:
          errorMessage = error.error?.message || 'Invalid request';
          break;
        case 401:
          errorMessage = 'Invalid credentials';
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        case 404:
          errorMessage = 'Service not found';
          break;
        case 409:
          errorMessage = 'User already exists';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation error';
          break;
        case 500:
          errorMessage = 'Server error';
          break;
        default:
          errorMessage = `Server error: ${error.status}`;
      }

      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}



