import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, SignUpCredentials } from '../auth.service';

interface DataNode {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  type: string;
  active: boolean;
  valid: boolean;
}

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styles: [],
})
export class SignupComponent {
  isProcessing = signal(false);
  errorMessage = signal<string | null>(null);
  successState = signal(false);

  dataNodes = signal<DataNode[]>([
    {
      id: 'name',
      label: 'Full Name',
      value: '',
      placeholder: 'John Doe',
      type: 'text',
      active: false,
      valid: false,
    },
    {
      id: 'email',
      label: 'Email Address',
      value: '',
      placeholder: 'john@example.com',
      type: 'email',
      active: false,
      valid: false,
    },
    {
      id: 'password',
      label: 'Password',
      value: '',
      placeholder: 'Min. 8 characters',
      type: 'password',
      active: false,
      valid: false,
    },
  ]);

  // Computed validation state
  allNodesValid = computed(() => {
    const nodes = this.dataNodes();
    return nodes.every((node) => node.valid && node.value.length > 0);
  });

  canInitialize = computed(() => {
    return this.allNodesValid() && !this.isProcessing();
  });

  constructor(private authService: AuthService, private router: Router) {}

  onNodeFocus(nodeId: string): void {
    this.dataNodes.update((nodes) =>
      nodes.map((node) => ({
        ...node,
        active: node.id === nodeId,
      }))
    );
  }

  onNodeBlur(nodeId: string): void {
    this.dataNodes.update((nodes) =>
      nodes.map((node) => ({
        ...node,
        active: false,
      }))
    );
    this.validateNode(nodeId);
  }

  onNodeInput(nodeId: string, value: string): void {
    this.dataNodes.update((nodes) =>
      nodes.map((node) => (node.id === nodeId ? { ...node, value } : node))
    );
    this.validateNode(nodeId);
    this.errorMessage.set(null);
  }

  private validateNode(nodeId: string): void {
    this.dataNodes.update((nodes) =>
      nodes.map((node) => {
        if (node.id !== nodeId) return node;

        let isValid = false;
        switch (nodeId) {
          case 'name':
            isValid = node.value.trim().length >= 2;
            break;
          case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(node.value);
            break;
          case 'password':
            isValid = node.value.length >= 6;
            break;
        }

        return { ...node, valid: isValid };
      })
    );
  }

  async initializeSystem(): Promise<void> {
    if (!this.canInitialize()) return;

    this.isProcessing.set(true);
    this.errorMessage.set(null);

    const nodes = this.dataNodes();
    const credentials: SignUpCredentials = {
      name: nodes.find((n) => n.id === 'name')!.value,
      email: nodes.find((n) => n.id === 'email')!.value,
      password: nodes.find((n) => n.id === 'password')!.value,
    };

    this.authService.signup(credentials).subscribe({
      next: () => {
        this.successState.set(true);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1200);
      },
      error: (error) => {
        this.isProcessing.set(false);
        this.errorMessage.set(
          error.error?.message || 'Failed to create account. Please try again.'
        );
      },
    });
  }
}
