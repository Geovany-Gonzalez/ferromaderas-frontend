import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Policy, PolicyService } from '../../../core/services/policy';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-policies-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policies-admin.html',
  styleUrl: './policies-admin.scss',
})
export class PoliciesAdminComponent implements OnInit {
  private policyService = inject(PolicyService);
  public policies: Policy[] = [];
  public previewPolicies: Policy[] = [];
  public isPreview = false;

  ngOnInit(): void {
    this.policyService.getPolicies().subscribe(policies => {
      this.policies = JSON.parse(JSON.stringify(policies));
    });
  }

  onSave() {
    this.policyService.updatePolicies(this.policies);
    alert('Políticas guardadas');
  }

  onPreview() {
    this.previewPolicies = JSON.parse(JSON.stringify(this.policies));
    this.isPreview = true;
  }

  onEdit() {
    this.isPreview = false;
  }

  addPolicy() {
    this.policies.push({ title: '', icon: '', content: [''] });
  }

  removePolicy(index: number) {
    this.policies.splice(index, 1);
  }

  addContent(policy: Policy) {
    policy.content.push('');
  }

  removeContent(policy: Policy, index: number) {
    policy.content.splice(index, 1);
  }

  trackByFn(index: any, item: any) {
    return index;
  }
}
