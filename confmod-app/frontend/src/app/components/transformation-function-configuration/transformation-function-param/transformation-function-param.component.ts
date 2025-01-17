import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ComponentRef, DestroyRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, Type, ViewContainerRef } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from 'primeng/inputtext';
import { BasePipelineFunctionParam } from '../../../types/transform-functions';
import { FloatParameterComponent } from '../parameters/float-parameter.component';
import { EnumParameterComponent } from '../parameters/enum-parameter.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BooleanParameterComponent } from '../parameters/boolean-parameter.component';
import { StringParameterComponent } from '../parameters/string-parameter.component';

@Component({
  selector: 'app-transformation-function-param',
  standalone: true,
  imports: [
    CommonModule,
    InputNumberModule,
    InputTextModule,
    DropdownModule
  ],
  templateUrl: './transformation-function-param.component.html',
  styleUrl: './transformation-function-param.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransformationFunctionParamComponent implements OnChanges {
  @Input({ required: true })
  param!: BasePipelineFunctionParam<any>;

  @Output()
  argumentChange = new EventEmitter<any>();

  protected viewContainer = inject(ViewContainerRef);
  protected destoryRef = inject(DestroyRef);
  protected componentRef!: ComponentRef<any>;
  protected componentInput: any;

  ngOnChanges(changes: SimpleChanges): void {
    if ('param' in changes) {
      this.createComponent();
    }
  }

  protected createComponent() {
    let componentClass: Type<any>;
    switch (this.param.type) {
      case "int":
        componentClass = FloatParameterComponent;
        break;
      case "enum":
        componentClass = EnumParameterComponent;
        break;
      case "float":
        componentClass = FloatParameterComponent;
        break;
      case "boolean":
        componentClass = BooleanParameterComponent;
        break;
      case "string":
        componentClass = StringParameterComponent;
        break;
      default:
        throw new Error("Unsupported Parameter Type")
    }
    this.componentRef = this.viewContainer.createComponent(componentClass);
    this.componentRef.setInput("param", this.param);
    this.componentRef.instance.argumentChange.pipe(
      takeUntilDestroyed(this.destoryRef)
    ).subscribe((arg: any) => {
      this.argumentChange.emit(arg);
    })
  }
}
