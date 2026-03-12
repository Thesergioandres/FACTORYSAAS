const { execSync } = require('child_process');
const fs = require('fs');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  fs.writeFileSync('output.log', 'Build OK', 'utf-8');
} catch (e) {
  fs.writeFileSync('output.log', e.stdout.toString(), 'utf-8');
}
