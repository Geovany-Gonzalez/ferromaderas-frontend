import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Policy, PolicyService } from '../../../core/services/policy';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './policies.component.html',
  styleUrl: './policies.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PoliciesComponent {
  private policyService = inject(PolicyService);
  public policies$: Observable<Policy[]> = this.policyService.getPolicies();
}
