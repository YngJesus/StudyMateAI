import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectDetail } from './subject-detail';

describe('SubjectDetail', () => {
  let component: SubjectDetail;
  let fixture: ComponentFixture<SubjectDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
