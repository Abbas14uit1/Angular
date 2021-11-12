import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { inject, TestBed } from "@angular/core/testing";
import { MaterialModule } from "../material/material.module";
import { AdminService } from "./admin.service";

describe("AdminService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminService],
      imports: [MaterialModule, HttpClientModule],
    });
  });

  it("should be created", inject([AdminService], (service: AdminService) => {
    expect(service).toBeTruthy();
  }));
});
