const { execSync } = require('child_process');
const fs = require('fs');

try {
  const out = execSync('npx jest src/modules/pos/application/use-cases/RegisterSaleUseCase.test.ts --no-color');
  fs.writeFileSync('jest.log', out.toString());
} catch (e) {
  let log = '';
  if (e.stdout) log += e.stdout.toString() + '\n';
  if (e.stderr) log += e.stderr.toString() + '\n';
  fs.writeFileSync('jest.log', log);
}
