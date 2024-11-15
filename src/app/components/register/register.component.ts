import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordValidator()]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'passwordMismatch': true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      const { confirmPassword, ...registrationData } = this.registerForm.value;
      
      this.authService.register(registrationData).subscribe({
        next: () => {
          this.snackBar.open('O registo foi um sucesso! Por favor entre!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/login']);
        },
        error: (error: { message: any; }) => {
          this.snackBar.open(error.message, 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control: any) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const password = control.value;
    const errors: { [key: string]: boolean } = {}; // Definindo o tipo explicitamente

    if (password) {
      if (password.length < 6) {
        errors['minlength'] = true; // Pelo menos 6 letras
      }
      if (!/[a-z]/.test(password)) {
        errors['noLowerCase'] = true; // Uma letra minúscula
      }
      if (!/[A-Z]/.test(password)) {
        errors['noLowerCase'] = true; // Uma letra minúscula
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors['noSpecialChar'] = true; // Um caracter especial
      }
    }

    return Object.keys(errors).length ? errors : null;
  };
}
