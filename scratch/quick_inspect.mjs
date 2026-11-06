import fs from 'fs';
import { INDUSTRY_PRESETS, MVP_ROLES, PLATFORM_ROLES } from '../src/data/industryData.js';

const sidebarCode = fs.readFileSync('./src/components/layout/Sidebar.jsx', 'utf8');

console.log(JSON.stringify({
  tenants: Object.keys(INDUSTRY_PRESETS),
  platformRoles: PLATFORM_ROLES.map(r => r.name)
}, null, 2));

