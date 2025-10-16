export interface DeviceRequestDTO {
  idDevice?: number;
  name: string;
  idArea: number;
  idBrand: number;
  deviceType: string;
  storage?: string;
  graphics_card?: string;
  ram?: string;
  processor?: string;
  product_code: string;
  serial_no: string;
  windows_edition?: string;
  idStatusDevice: number;
  idWarranty: number;
  observation?: string;
  lifecycleFile?: any;
}
