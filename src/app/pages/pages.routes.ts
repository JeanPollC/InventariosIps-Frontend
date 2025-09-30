import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { BrandComponent } from "./brand/brand.component";

export const pagesRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent},
    { path: 'brand', component: BrandComponent}
]