import { INDUSTRY_PRESETS, MVP_ROLES, PLATFORM_ROLES } from '../src/data/industryData.js';

// Let's print out all tenants and their roles
for (const [key, preset] of Object.entries(INDUSTRY_PRESETS)) {
  console.log(`\n======================================================`);
  console.log(`🏢 TENANT: ${preset.name} (${key})`);
  console.log(`Tagline: ${preset.tagline}`);
  console.log(`AI Agents (${preset.aiEmployees.length}): ${preset.aiEmployees.map(a => `${a.name} [${a.role}]`).join(', ')}`);
  console.log(`Human Roles (${preset.humanRoles.length}):`);
  preset.humanRoles.forEach(r => {
    console.log(`  • ${r.name} [Dept: ${r.dept}] - Access: ${r.access || 'Full'}`);
  });
}

