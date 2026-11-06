import { INDUSTRY_PRESETS, MVP_ROLES, PLATFORM_ROLES } from '../src/data/industryData.js';
import fs from 'fs';

console.log('PLATFORM ROLES:');
PLATFORM_ROLES.forEach(r => console.log(`- ${r.name} (${r.id})`));

console.log('\nMVP ROLES:');
MVP_ROLES.forEach(r => console.log(`- ${r.name} (${r.id})`));

console.log('\nTENANTS & HUMAN ROLES:');
for (const [key, preset] of Object.entries(INDUSTRY_PRESETS)) {
  console.log(`\nTENANT: ${preset.name} [id: ${key}]`);
  console.log('AI Agents:', preset.aiEmployees.map(a => a.name).join(', '));
  console.log('Human Roles:');
  preset.humanRoles.forEach(r => console.log(`  * ${r.name} | Dept: ${r.dept} | Access: ${r.access || 'Full'}`));
}

