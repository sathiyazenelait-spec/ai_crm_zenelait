import fs from 'fs';
import { INDUSTRY_PRESETS, PLATFORM_ROLES } from '../src/data/industryData.js';

// Read Sidebar.jsx to ensure we don't miss any role
const sidebarCode = fs.readFileSync('./src/components/layout/Sidebar.jsx', 'utf8');

console.log('Sidebar length:', sidebarCode.length);

