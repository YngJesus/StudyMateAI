import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginCredentials } from '../auth.service';

interface AccessNode {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  type: string;
  active: boolean;
  valid: boolean;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styles: [
    `
      @keyframes scanMove {
        from {
          transform: translateY(0);
        }
        to {
          transform: translateY(20px);
        }
      }
      @keyframes fieldSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .scan-animate {
        animation: scanMove 8s linear infinite;
      }
      .field-slide-in {
        animation: fieldSlideIn 0.5s ease-out backwards;
      }
    `,
  ],
})
export class LoginComponent {
  // Streamlined authentication state
  isAuthenticating = signal(false);
  errorMessage = signal<string | null>(null);
  accessGranted = signal(false);

  // Simplified two-node system for quick access
  accessNodes = signal<AccessNode[]>([
    {
      id: 'email',
      label: 'Identity',
      value: '',
      placeholder: 'your@email.com',
      type: 'email',
      active: false,
      valid: false,
    },
    {
      id: 'password',
      label: 'Key',
      value: '',
      placeholder: 'Password',
      type: 'password',
      active: false,
      valid: false,
    },
  ]);

  // Quick validation
  canAccess = computed(() => {
    const nodes = this.accessNodes();
    return nodes.every((node) => node.value.length > 0) && !this.isAuthenticating();
  });

  constructor(private authService: AuthService, private router: Router) {}

  onNodeFocus(nodeId: string): void {
    this.accessNodes.update((nodes) =>
      nodes.map((node) => ({
        ...node,
        active: node.id === nodeId,
      }))
    );
  }

  onNodeBlur(nodeId: string): void {
    this.accessNodes.update((nodes) =>
      nodes.map((node) => ({
        ...node,
        active: false,
      }))
    );
    this.validateNode(nodeId);
  }

  onNodeInput(nodeId: string, value: string): void {
    this.accessNodes.update((nodes) =>
      nodes.map((node) => (node.id === nodeId ? { ...node, value } : node))
    );
    this.errorMessage.set(null);
  }

  private validateNode(nodeId: string): void {
    this.accessNodes.update((nodes) =>
      nodes.map((node) => {
        if (node.id !== nodeId) return node;

        let isValid = false;
        if (nodeId === 'email') {
          isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(node.value) || node.value.length > 0;
        } else if (nodeId === 'password') {
          isValid = node.value.length > 0;
        }

        return { ...node, valid: isValid };
      })
    );
  }

  async accessSystem(): Promise<void> {
    if (!this.canAccess()) return;

    this.isAuthenticating.set(true);
    this.errorMessage.set(null);

    const nodes = this.accessNodes();
    const credentials: LoginCredentials = {
      email: nodes.find((n) => n.id === 'email')!.value,
      password: nodes.find((n) => n.id === 'password')!.value,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.accessGranted.set(true);

        // Quick transition to dashboard
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 800);
      },
      error: (error) => {
        this.isAuthenticating.set(false);
        this.errorMessage.set(
          error.error?.message || 'Access denied. Please check your credentials.'
        );
      },
    });
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.canAccess()) {
      this.accessSystem();
    }
  }
}
