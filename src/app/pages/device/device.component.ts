import { Component, inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap, tap } from 'rxjs';
import { Device } from '../../model/device';
import { DeviceService } from '../../services/device.service';
import { MaterialModule } from '../../material/material.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DeviceDetails } from '../../model/deviceDetails';
import { DeviceDialogComponent } from './device-dialog/device-dialog.component';
import { Brand } from '../../model/brand';
import { BrandService } from '../../services/brand.service';
import { AreasService } from '../../services/areas.service';
import { Area } from '../../model/area';
import { StatusDeviceService } from '../../services/status-device.service';
import { StatusDevice } from '../../model/statusDevice';

@Component({
  selector: 'app-devices',
  imports: [
    MaterialModule,
    MatExpansionModule,
    CommonModule,
  ],
  templateUrl: './device.component.html',
  styleUrl: './device.component.css'
})
export class DeviceComponent {

  brand: Brand[] = [];
  area: Area[] = [];
  statusDevice: StatusDevice[] = [];

  @ViewChild(MatSort) matSort: MatSort;
  @ViewChild('detailsDialog') detailsDialogTemplate;

  dataSource: MatTableDataSource<Device>;
  displayedColumns: string[] = ['name', 'deviceType', 'area', 'idUser', 'statusDevice', 'brand', 'actions']

  private deviceService = inject(DeviceService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);
  private brandService = inject(BrandService);
  private areaService = inject(AreasService);
  private statusDeviceService = inject(StatusDeviceService);


  ngOnInit(): void {
    this.deviceService.findAll().subscribe(data => { this.createTable(data); });
    this.deviceService.getDeviceChange().subscribe(data => this.createTable(data));
    this.deviceService.getMessageChange().subscribe(message => this._snackbar.open(message, 'INFO', { duration: 2000 }))

    this.loadInicialData();
  }

  loadInicialData() {
    this.brandService.findAll().subscribe(data => this.brand = data);
    this.areaService.findAll().subscribe(data => this.area = data);
    this.statusDeviceService.findAll().subscribe(data => this.statusDevice = data);
  }

  createTable(data: Device[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.matSort
  }

  viewDetails(device: Device) {
    const details: DeviceDetails = {
      storage: device['storage'],
      graphics_card: device['graphics_card'],
      ram: device['ram'],
      processor: device['processor'],
      product_code: device['product_code'],
      serial_no: device['serial_no'],
      windows_edition: device['windows_edition'],
      warranty: device['idWarranty'],
      observation: device['observation'],
      lifecycleFile: device['lifecycleFile']
    };

    this._dialog.open(this.detailsDialogTemplate, {
      width: '750px',
      data: details
    });
  }

  openEditDialog(device?: Device) {
    this._dialog.closeAll(); // Cierra el dialogo abirto antes de abrir el nuevo

    if (device) {
      const deviceDetails: DeviceDetails = {
        storage: device['storage'],
        graphics_card: device['graphics_card'],
        ram: device['ram'],
        processor: device['processor'],
        product_code: device['product_code'],
        serial_no: device['serial_no'],
        windows_edition: device['windows_edition'],
        warranty: device['warranty'], 
        observation: device['observation'],
        lifecycleFile: device['lifecycleFile']
      };

      this._dialog.open(DeviceDialogComponent, {
        width: '1000px',
        height: '700px',
        data: {
          device,          // 👈 el objeto Device
          details: deviceDetails // 👈 el objeto DeviceDetails
        }
      });
    } else {
      // Si vas a crear uno nuevo
      this._dialog.open(DeviceDialogComponent, {
        width: '1000px',
        height: '700px',
        data: null
      });
    }
  }

  delete(id: number) {
    this.deviceService.delete(id).pipe(
      switchMap(() => this.deviceService.findAll()),
      tap(data => this.deviceService.setDeviceChange(data)),
      tap(() => this.deviceService.setMessageChange('DELETED!'))
    ).subscribe();
  }
}

