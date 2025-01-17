import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { filter, map, tap } from 'rxjs';
import { RawConfmodConfigInput } from '../../openapi/model/rawConfmodConfigInput';
import { RawConfmodModelInput } from '../../openapi/model/rawConfmodModelInput';
import { EntriesPipe } from '../../pipes/entries.pipe';
import { ConcatPipe } from '../../pipes/concat.pipe';
import { RawFeatureConfig, RawFeatureSpec } from '../../openapi';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-scope-compare',
  standalone: true,
  imports: [
    CommonModule,
    EntriesPipe,
    ConcatPipe,
    ButtonModule,
    RouterLink
  ],
  templateUrl: './scope-compare.component.html',
  styleUrl: './scope-compare.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'container mx-auto'
  }
})
export class ScopeCompareComponent implements OnInit {
  private cdRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private activeRoute = inject(ActivatedRoute);

  protected configName: string = "";
  protected config!: RawConfmodConfigInput;
  protected model!: RawConfmodModelInput;
  protected slug!: string;

  ngOnInit(): void {
    this.activeRoute.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef),
      map(params => params.get("slug")),
      filter((slug): slug is string => slug !== null),
    ).subscribe((slug) => {
      this.slug = slug
      this.cdRef.markForCheck();
    });

    this.activeRoute.data.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((data) => console.debug("Got data", data)),
      map((data) => (
          {
          configName: data['config']?.name as string,
          config: data['config']?.config as RawConfmodConfigInput,
          model: data['model'] as RawConfmodModelInput,
        }
      ))
    ).subscribe((data) => {
      this.configName = data.configName;
      this.config = data.config;
      this.model = data.model;
      this.cdRef.markForCheck();
    })
  }

  protected isFeatureDatatypeIncluded(scope: string, observationLabel: string, featureLabel: string): boolean {
    const scopeConfig = this.config.scopes[scope];
    if (!scopeConfig) {
      return false;
    }
    const observationConfig = scopeConfig.observations[observationLabel];
    if (!observationConfig) {
      return false;
    }
    const featureConfig = observationConfig.features[featureLabel];
    if (!featureConfig) {
      return false;
    }

    return featureConfig.includeDataType ?? false;
  }

  protected isFeatureInPlayload(scope: string, observationLabel: string, featureLabel: string): boolean {
    const scopeConfig = this.config.scopes[scope];
    if (!scopeConfig) {
      return false;
    }
    const observationConfig = scopeConfig.observations[observationLabel];
    if (!observationConfig) {
      return false;
    }
    const featureConfig = observationConfig.features[featureLabel];
    if (!featureConfig) {
      return false;
    }

    return featureConfig.includePayload ?? observationConfig.includePayload ?? false;
  }

  protected getFeatureMetadata(scope: string, observationLabel: string, featureLabel: string): string[] {
    const scopeConfig = this.config.scopes[scope];
    if (!scopeConfig) {
      return [];
    }
    const observationConfig = scopeConfig.observations[observationLabel];
    if (!observationConfig) {
      return [];
    }
    const featureConfig = observationConfig.features[featureLabel];
    if (!featureConfig) {
      return [];
    }

    return featureConfig.metadata ?? [];
  }

  protected getFeatureRowSpan(observationLabel: string, featureLabel: string): number {
    const observation = this.model.head.observations[observationLabel];
    if (!observation) {
      return 0;
    }

    const feature = observation.features.find(feature => feature.label === featureLabel);
    if (!feature) {
      return 0;
    }

    return (feature.metadata?.length ?? 0) + 2;
  }

  protected getObservationRowSpan(observationLabel: string): number {
    const observation = this.model.head.observations[observationLabel];
    if (!observation) {
      return 0;
    }

    const sum = observation.features.map(feature => this.getFeatureRowSpan(observationLabel, feature.label))
      .reduce((sum, count) => sum + count, 0);

    console.debug(sum);

    return sum;
  }

  protected featureHasNoMetadata(featureSpec: RawFeatureSpec): boolean {
    return (featureSpec.metadata?.length ?? 0) <= 0;
  }
}
