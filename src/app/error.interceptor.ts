import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    private snackBar = inject(MatSnackBar);

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'Ocurrió un error desconocido.';
                
                // Si el error es una respuesta HTTP (del servidor)
                if (error.error instanceof ErrorEvent) {
                    // Error del lado del cliente o de red
                    errorMessage = `Error de red: ${error.error.message}`;
                } else {
                    // Error del lado del servidor (Status code y cuerpo)

                    // 1. Intentar obtener el mensaje específico de la excepción de Spring Boot
                    if (error.error && error.error.message) {
                        errorMessage = error.error.message;
                    } else if (error.status) {
                        // 2. Si no se puede obtener el cuerpo, mostrar el estado HTTP
                        errorMessage = `Error ${error.status}: ${error.statusText}`;
                    }
                }
                
                console.error(error);
                
                // 🛑 MUESTRA EL MENSAJE DE ERROR USANDO MatSnackBar
                this.snackBar.open(
                    errorMessage, 
                    'ERROR', 
                    {
                        duration: 5000,
                        panelClass: ['snackbar-error'] // Clase CSS para estilizar
                    }
                );

                // Relanza el error para que el componente que lo llama pueda manejar
                // lógica adicional si es necesario (ej: cerrar un diálogo)
                return throwError(() => new Error(errorMessage));
            })
        );
    }
}