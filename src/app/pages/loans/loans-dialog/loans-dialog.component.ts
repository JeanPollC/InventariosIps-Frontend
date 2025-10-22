import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, switchMap, tap } from 'rxjs';
import { Device } from '../../../model/device';
import { Loans } from '../../../model/loans';
import { User } from '../../../model/user';
import { DeviceService } from '../../../services/device.service';
import { LoansService } from '../../../services/loans.service';
import { UserService } from '../../../services/user.service';
import { MaterialModule } from '../../../material/material.module';

@Component({
  selector: 'app-loans-dialog',
  imports: [
    MaterialModule
  ],
  templateUrl: './loans-dialog.component.html',
  styleUrl: './loans-dialog.component.css'
})
export class LoansDialogComponent {

  loans: Loans
  title: string = 'Nuevo Prestamo'
  selectedFile: File;

  users$: Observable<User[]>
  devices$: Observable<Device[]>

  readonly dialogRef = inject(MatDialogRef<LoansDialogComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  readonly loansService = inject(LoansService);
  readonly userService = inject(UserService);
  readonly deviceService = inject(DeviceService);


  ngOnInit() {
    if (this.data && this.data.idLoans > 0) {
      this.title = 'Editar Prestamo';
      this.loans = {
        idLoans: this.data.idLoans,
        idUser: this.data.user?.idUser,
        idDevice: this.data.device?.idDevice,
        startDateLoan: this.data.startDateLoan,
        endDateLoan: this.data.endDateLoan,
        loanDocument: this.data.loanDocument,
      };
    } else {
      this.loans = new Loans();
    }

    this.users$ = this.userService.findAll();
    this.devices$ = this.deviceService.findAll();
  }

  close() {
    this.dialogRef.close();
  }

  operate() {
    //UPDATE
    if (this.loans != null && this.loans.idLoans > 0) {
      this.loansService.update(this.loans.idLoans, this.loans).pipe(
        switchMap(() => this.loansService.findAll()),
        tap(data => this.loansService.setLoansChange(data)),
        tap(() => this.loansService.setMessageChange('UPDATED!'))
      ).subscribe();
    } else {
      //SAVE
      this.loansService.save(this.loans).pipe(
        switchMap(() => this.loansService.findAll()),
        tap(data => this.loansService.setLoansChange(data)),
        tap(() => this.loansService.setMessageChange('CREATED!'))
      ).subscribe();
    }

    this.close();
  }

  onFileSelected(event: any){
    this.selectedFile = event.target.files[0];
  }

  uploadDocument(){
    if(!this.selectedFile){
      this.loansService.setMessageChange('Debe seleccionar un archivo PDF primero')
      return;
    }

    const loanId = this.loans.idLoans;

    this.loansService.uploadPdf(this.selectedFile, loanId).subscribe({
      next: () => {
        this.loansService.setMessageChange('Documento subido exitosamente')
      },
      error: err => {
        console.log(err);
        this.loansService.setMessageChange('Error al subir documento');
      }
    })
  }


}
