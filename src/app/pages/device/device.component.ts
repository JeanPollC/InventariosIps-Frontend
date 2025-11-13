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
import { Area } from '../../model/areas';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

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

  // 🎯 Variables para manejar la paginación
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;

  @ViewChild(MatSort) matSort: MatSort;
  @ViewChild('detailsDialog') detailsDialogTemplate;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: MatTableDataSource<Device>;
  displayedColumns: string[] = ['name', 'deviceType', 'area', 'user', 'statusDevice', 'brand', 'actions']

  private deviceService = inject(DeviceService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);
  private brandService = inject(BrandService);
  private areaService = inject(AreasService);


  ngOnInit(): void {
    this.loadPage(this.currentPage, this.pageSize);
    this.deviceService.findAll().subscribe(data => { this.createTable(data); });
    this.deviceService.getDeviceChange().subscribe(data => this.createTable(data));
    this.deviceService.getMessageChange().subscribe(message => this._snackbar.open(message, 'INFO', { duration: 2000 }))

    this.loadInicialData();
  }

  loadPage(page: number, size: number): void {
    this.deviceService.findAllPageable(page, size).subscribe((pageData) => {
      this.totalElements = pageData.totalElements;
      this.currentPage = pageData.number;
      this.pageSize = pageData.size;

      this.dataSource = new MatTableDataSource(pageData.content);
      this.dataSource.sort = this.matSort;
    });
  }

  onPageChange(event: PageEvent): void {
    this.loadPage(event.pageIndex, event.pageSize);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.dataSource) {
        this.dataSource.sort = this.matSort;
      }
    });
  }

  loadInicialData() {
    this.brandService.findAll().subscribe(data => this.brand = data);
    this.areaService.findAll().subscribe(data => this.area = data);
  }

  createTable(data: Device[]) {
    this.dataSource = new MatTableDataSource(data);

    data.forEach(device => {
    // Verificamos si el dispositivo está prestado o asignado
    const status = (device as any)?.statusDevice?.nameStatus?.toLowerCase() || '';

    // Si está prestado, usamos el servicio correspondiente
    if (status.includes('prestado')) {
      this.deviceService.getNameUserByNameDeviceLoan(device.name).subscribe({
        next: userName => (device as any).userName = userName,
        error: () => (device as any).userName = 'N/A'
      });
    }
    // Si está asignado, usamos el otro servicio
    else if (status.includes('asignado')) {
      this.deviceService.getNameUserByNameDevice(device.name).subscribe({
        next: userName => (device as any).userName = userName,
        error: () => (device as any).userName = 'N/A'
      });
    }
  });

    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'area':
          return item.area?.nameArea?.toLowerCase() || '';
        case 'statusDevice':
          return item.statusDevice?.description?.toLowerCase() || '';
        case 'brand':
          return item.brand?.description?.toLowerCase() || '';
        default:
          return item[property]?.toString().toLowerCase() || '';
      }
    };

    if (this.matSort) {
      this.dataSource.sort = this.matSort;
    }
  }

  viewDetails(device: Device) {

    this._dialog.open(this.detailsDialogTemplate, {
      width: '750px',
      data: device
    });
  }

  openEditDialog(data?: any) {
    this._dialog.closeAll(); // Cierra el dialogo abirto antes de abrir el nuevo

    const device: Device = {
      idDevice: data?.idDevice ?? 0,
      name: data?.name ?? '',
      idArea: data?.area.idArea ?? null,
      idBrand: data?.brand.idBrand ?? null,
      deviceType: data?.deviceType ?? '',
      idStatusDevice: data?.statusDevice.idStatusDevice ?? 0
    };

    const deviceDetails: DeviceDetails = {
      storage: data?.storage ?? '',
      graphics_card: data?.graphics_card ?? '',
      ram: data?.ram ?? '',
      processor: data?.processor ?? '',
      product_code: data?.product_code ?? '',
      serial_no: data?.serial_no ?? '',
      windows_edition: data?.windows_edition ?? '',
      idWarranty: data?.warranty?.idWarranty ?? null,
      observation: data?.observation ?? '',
      lifecycleFile: data?.lifecycleFile ?? ''
    };

    this._dialog.open(DeviceDialogComponent, {
      width: '750px',
      data: {
        device,
        deviceDetails
      }
    })
  }

  delete(id: number) {
    this.deviceService.delete(id).pipe(
      switchMap(() => this.deviceService.findAllPageable(this.currentPage, this.pageSize)),
      tap( pageData => {
            // Actualizar el total y los datos de la tabla después del borrado
            this.totalElements = pageData.totalElements;
            this.dataSource = new MatTableDataSource(pageData.content);
            this.dataSource.sort = this.matSort;

            this.deviceService.setMessageChange('DELETED!')
        })
    ).subscribe();
  }

  applyFilter(e: any) {
    this.dataSource.filter = e.target.value;
  }

  openPdf(url: string) {
  if (url) {
    window.open(url, '_blank');
  } else {
    alert('No hay documento adjunto para este préstamo.');
  }}

}

