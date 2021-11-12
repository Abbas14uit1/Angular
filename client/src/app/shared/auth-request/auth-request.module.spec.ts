import { async, inject, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { AuthRequest } from "./auth-request.module";

describe("AuthRequest", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      providers: [AuthRequest],
    });
  });

  it("should ...", inject([AuthRequest], (headerRequest: AuthRequest) => {
    expect(headerRequest).toBeTruthy();
  }));
});
