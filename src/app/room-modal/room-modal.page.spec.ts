import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RoomModalPage } from './room-modal.page';

describe('RoomModalPage', () => {
  let component: RoomModalPage;
  let fixture: ComponentFixture<RoomModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RoomModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
