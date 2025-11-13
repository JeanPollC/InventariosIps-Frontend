import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { Device } from '../../../model/device';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map, Observable, switchMap, tap } from 'rxjs';
import { DeviceService } from '../../../services/device.service';
import { DeviceDetails } from '../../../model/deviceDetails';
import { BrandService } from '../../../services/brand.service';
import { Brand } from '../../../model/brand';
import { Area } from '../../../model/areas';
import { AreasService } from '../../../services/areas.service';
import { Warranty } from '../../../model/warranty';
import { WarrantyService } from '../../../services/warraty.service';
import { StatusDevice } from '../../../model/statusDevice';
import { StatusDeviceService } from '../../../services/status-device.service';
import { NgForm } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-device-dialog',
  imports: [MaterialModule, MatExpansionModule],
  templateUrl: './device-dialog.component.html',
  styleUrl: './device-dialog.component.css',
})
export class DeviceDialogComponent {
  device: Device;
  deviceDetails: DeviceDetails;
  title: string;
  selectedFile: File;

  brands$: Observable<Brand[]>;
  areas$: Observable<Area[]>;
  status$: Observable<StatusDevice[]>;

  warranty: Warranty = new Warranty();

  readonly dialogRef = inject(MatDialogRef<DeviceDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA);
  readonly deviceService = inject(DeviceService);
  private brandService = inject(BrandService);
  private areaService = inject(AreasService);
  private warrantyService = inject(WarrantyService);
  private statusDeviceService = inject(StatusDeviceService);

  ngOnInit() {
    if (this.data && this.data.device && this.data.device.idDevice > 0) {
      this.device = { ...this.data.device };
      this.deviceDetails = { ...this.data.deviceDetails };
      this.title = 'Editar Dispositivo';

      if (this.deviceDetails.idWarranty) {
        this.warranty.idWarranty = this.deviceDetails.idWarranty;

        this.warrantyService.findById(this.deviceDetails.idWarranty).subscribe({
          next: (warrantyData) => {
            // Asignar los datos al modelo warranty
            this.warranty = warrantyData;

            if (this.warranty.startDate) {
              // Crea un objeto Date a partir del string de fecha
              this.warranty.startDate = new Date(this.warranty.startDate);
            }
            if (this.warranty.endDate) {
              // Crea un objeto Date a partir del string de fecha
              this.warranty.endDate = new Date(this.warranty.endDate);
            }
          },
          error: (err) => console.error('Error al cargar la garantía:', err),
        });
      }
    } else {
      this.device = new Device();
      this.deviceDetails = new DeviceDetails();
      this.title = 'Nuevo Dispositivo';
      this.warranty = new Warranty();
    }
    this.loadInicialData();
  }

  loadInicialData() {
    this.brands$ = this.brandService.findAll();
    this.areas$ = this.areaService.findAll();
    this.status$ = this.statusDeviceService.findAll();
  }

  close() {
    this.dialogRef.close();
  }

  operate() {
    const deviceRequest = {
      idDevice: this.device.idDevice,
      name: this.device.name,
      idArea: this.device.idArea,
      idBrand: this.device.idBrand,
      deviceType: this.device.deviceType,
      storage: this.deviceDetails.storage,
      graphics_card: this.deviceDetails.graphics_card,
      ram: this.deviceDetails.ram,
      processor: this.deviceDetails.processor,
      product_code: this.deviceDetails.product_code,
      serial_no: this.deviceDetails.serial_no,
      windows_edition: this.deviceDetails.windows_edition,
      idStatusDevice: this.device.idStatusDevice,
      idWarranty: this.deviceDetails.idWarranty,
      observation: this.deviceDetails.observation,
      lifecycleFile: this.deviceDetails.lifecycleFile,
    };
    const hasFile = !!this.selectedFile;

    //UPDATE
    if (this.device != null && this.device.idDevice > 0) {
      this.deviceService
        .update(this.device.idDevice, deviceRequest)
        .pipe(
          switchMap(() => this.uploadDocument(this.device.idDevice)),
          switchMap(() => this.deviceService.findAll()),
          tap((data) => this.deviceService.setDeviceChange(data)),
          tap(() => this.deviceService.setMessageChange('UPDATED!')),
          tap(() =>
            this.deviceService.setMessageChange(
              hasFile
                ? 'Actualizado con documento'
                : 'Actualizado sin documento'
            )
          )
        )
        .subscribe({
          next: () => this.close(),
          error: (err) => console.error('Error al actualizar dispositvo:', err),
        });
    } else {
      //SAVE
      const hasWarrantyData =
        this.warranty.statusWarranty ||
        this.warranty.startDate ||
        this.warranty.endDate;

      let saveObservable: Observable<any>;

      if (hasWarrantyData) {
        // 1. Guardar Garantía -> 2. Guardar Dispositivo
        saveObservable = this.warrantyService.save(this.warranty).pipe(
          switchMap((savedWarranty: Warranty) => {
            if (savedWarranty) {
              deviceRequest.idWarranty = savedWarranty.idWarranty;
              this.deviceDetails.idWarranty = savedWarranty.idWarranty;
            } else {
              deviceRequest.idWarranty = null;
              this.deviceDetails.idWarranty = null;
            }

            // Luego guardamos el dispositivo
            return this.deviceService.save(deviceRequest);
          })
        );
      } else {
        // 1. Guardar Dispositivo SIN Garantía
        deviceRequest.idWarranty = null; // Aseguramos que el ID de garantía no se envíe vacío o inválido
        saveObservable = this.deviceService.save(deviceRequest);
      }

      // Aplicamos el resto de la lógica (documentos, recarga, mensajes) a AMBOS flujos
      saveObservable
        .pipe(
          switchMap((savedDevice: Device) =>
            this.uploadDocument(savedDevice.idDevice).pipe(
              map(() => savedDevice)
            )
          ),
          switchMap(() => this.deviceService.findAll()),
          tap((data) => this.deviceService.setDeviceChange(data)),
          tap(() => this.deviceService.setMessageChange('CREATED!')),
          tap(() =>
            this.deviceService.setMessageChange(
              hasFile ? 'Creado con documento' : 'Creado sin documento'
            )
          )
        )
        .subscribe({
          next: () => this.close(),
          error: (err) => console.error('Error al crear dispositvo:', err),
        });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      this.deviceDetails.lifecycleFile = this.selectedFile.name;
    }
  }

  uploadDocument(deviceId: number) {
    if (this.selectedFile) {
      return this.deviceService.uploadPdf(this.selectedFile, deviceId);
    } else {
      return new Observable((observer) => {
        observer.next(null);
        observer.complete();
      });
    }
  }

  onEnter(form: NgForm) {
    if (form.invalid) {
      // Aquí puedes usar un snack-bar o un alert simple
      alert(
        'Por favor, complete todos los campos obligatorios antes de guardar.'
      );
      return;
    }

    // Si el formulario está completo, ejecuta la acción normal
    this.operate();
  }
}
