const { execSync } = require('child_process');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('Build OK');
} catch (e) {
  console.log(e.stdout.toString());
}
