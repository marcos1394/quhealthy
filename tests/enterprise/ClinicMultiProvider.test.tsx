import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StaffManager, StaffMember } from '@/components/marketplace/StaffManager';
import { FoundationStickyActionCard } from '@/components/foundation/FoundationStickyActionCard';
import { FoundationPublicStorefront } from '@/types/foundation';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('COM-ENTERPRISE-01: Gestión de Clínicas Multi-Médico y Subsidios en Foundation', () => {
  const mockStaff: StaffMember[] = [
    {
      id: 101,
      name: 'Dra. Sofía Alarcón',
      specialty: 'Cardiología',
      bio: 'Especialista en insuficiencia cardíaca y ecocardiografía.',
      role: 'PHYSICIAN',
      branch: 'SEDE_PRINCIPAL',
    },
  ];

  it('permite cambiar el rol institucional en la clínica (CLINIC_ADMIN, RECEPTIONIST, PHYSICIAN)', () => {
    const handleUpdate = vi.fn();

    render(
      <StaffManager
        staff={mockStaff}
        onAdd={vi.fn()}
        onUpdate={handleUpdate}
        onDelete={vi.fn()}
        isBusinessPlan={true}
      />
    );

    const roleSelect = screen.getByTestId('clinic-member-role-select') as HTMLSelectElement;
    expect(roleSelect).toBeInTheDocument();
    expect(roleSelect.value).toBe('PHYSICIAN');

    fireEvent.change(roleSelect, { target: { value: 'CLINIC_ADMIN' } });
    expect(handleUpdate).toHaveBeenCalledWith(101, 'role', 'CLINIC_ADMIN');

    fireEvent.change(roleSelect, { target: { value: 'RECEPTIONIST' } });
    expect(handleUpdate).toHaveBeenCalledWith(101, 'role', 'RECEPTIONIST');
  });

  it('permite seleccionar la sucursal o consultorio asignado para el miembro de la clínica', () => {
    const handleUpdate = vi.fn();

    render(
      <StaffManager
        staff={mockStaff}
        onAdd={vi.fn()}
        onUpdate={handleUpdate}
        onDelete={vi.fn()}
        isBusinessPlan={true}
      />
    );

    const branchSelect = screen.getByTestId('clinic-branch-selector') as HTMLSelectElement;
    expect(branchSelect).toBeInTheDocument();
    expect(branchSelect.value).toBe('SEDE_PRINCIPAL');

    fireEvent.change(branchSelect, { target: { value: 'SUCURSAL_NORTE' } });
    expect(handleUpdate).toHaveBeenCalledWith(101, 'branch', 'SUCURSAL_NORTE');
  });

  it('permite solicitar subsidio en el portal asistencial con selector estable data-testid="foundation-subsidy-apply-btn"', () => {
    const handleApply = vi.fn();
    const mockStorefront: FoundationPublicStorefront = {
      id: 1,
      legalName: 'Fundación CardioMex I.A.P.',
      brandName: 'Fundación CardioMex',
      organizationType: 'I.A.P.',
      primaryColor: '#059669',
      primaryCauses: ['CARDIOVASCULAR'],
      verificationStatus: 'VERIFIED',
      programs: [
        {
          id: 50,
          foundationId: 1,
          name: 'Corazón Sano 2026',
          description: 'Subsidio total de consultas cardiológicas',
          cause: 'CARDIOVASCULAR',
          supportTypes: ['CONSULTATION'],
          requiredDocuments: ['INE', 'CURP'],
          targetBeneficiariesCount: 100,
          activeBeneficiariesCount: 12,
          allocatedBudget: 500000,
          disbursedBudget: 45000,
          status: 'ACTIVE',
        },
      ],
      campaigns: [],
      totalBeneficiariesCount: 12,
      totalActiveProgramsCount: 1,
    };

    render(
      <FoundationStickyActionCard
        storefront={mockStorefront}
        onApplyClick={handleApply}
        primaryProgram={mockStorefront.programs[0]}
      />
    );

    const applyBtn = screen.getByTestId('foundation-subsidy-apply-btn');
    expect(applyBtn).toBeInTheDocument();

    fireEvent.click(applyBtn);
    expect(handleApply).toHaveBeenCalledTimes(1);
  });
});
