import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map, Observable, switchMap, tap } from 'rxjs';
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
      
      this.devices$ = this.deviceService.getAvailableDevices().pipe(
        map(devices => {
          const currentDevice = this.data.device;
          if (currentDevice) {
            const exists = devices.some(d => d.idDevice === currentDevice.idDevice);
            if (!exists) {
              devices = [...devices, currentDevice];
            }
          }
          return devices;
        })
      );

    } else {
      this.loans = new Loans();
      // ✅ Al crear: solo mostrar dispositivos disponibles
      this.devices$ = this.deviceService.getAvailableDevices();
    }


    this.users$ = this.userService.findAll();
  }

  close() {
    this.dialogRef.close();
  }

  operate() {
    //UPDATE
    if (this.loans != null && this.loans.idLoans > 0) {
      this.loansService.update(this.loans.idLoans, this.loans).pipe(
        switchMap(() => this.uploadDocument(this.loans.idLoans)),
        switchMap(() => this.loansService.findAll()),
        tap(data => this.loansService.setLoansChange(data)),
        tap(() => this.loansService.setMessageChange('UPDATED!'))
      ).subscribe();
    } else {
      //SAVE
      this.loansService.save(this.loans).pipe(
        switchMap((savedLoan: Loans) => this.uploadDocument(savedLoan.idLoans)),
        switchMap(() => this.loansService.findAll()),
        tap(data => this.loansService.setLoansChange(data)),
        tap(() => this.loansService.setMessageChange('CREATED!'))
      ).subscribe();
    }

    this.close();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadDocument(loanId: number) {
    if (this.selectedFile) {
      return this.loansService.uploadPdf(this.selectedFile, loanId);
    } else {
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      })
    }
  }

}
