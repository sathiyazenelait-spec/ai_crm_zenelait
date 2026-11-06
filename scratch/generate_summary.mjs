import fs from 'fs';
import { INDUSTRY_PRESETS, MVP_ROLES, PLATFORM_ROLES } from '../src/data/industryData.js';

// Let's create an exhaustive JSON structure of all tenants, roles, and sidebar features
const summary = {
  platform: {
    title: 'Platform Master Roles (SaaS God Mode & Infrastructure)',
    roles: PLATFORM_ROLES.map(r => ({
      name: r.name,
      badge: r.badge,
      description: r.description,
      permissions: r.permissions
    }))
  },
  tenants: {}
};

for (const [key, preset] of Object.entries(INDUSTRY_PRESETS)) {
  summary.tenants[key] = {
    name: preset.name,
    tagline: preset.tagline,
    aiAgents: preset.aiEmployees.map(a => ({
      name: a.name,
      role: a.role,
      description: a.description
    })),
    humanRoles: preset.humanRoles.map(r => ({
      name: r.name,
      dept: r.dept,
      access: r.access || 'Full'
    }))
  };
}

console.log('Total Tenants:', Object.keys(summary.tenants).length);
fs.writeFileSync('./scratch/tenants_summary.json', JSON.stringify(summary, null, 2));

