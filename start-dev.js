const path = require('path');
const { spawn } = require('child_process');

const projectDir = __dirname;
const nextBin = path.join(projectDir, 'node_modules', 'next', 'dist', 'bin', 'next');
const port = process.env.PORT || 3001;

process.chdir(projectDir);

const child = spawn(process.execPath, [nextBin, 'dev', '--port', String(port)], {
  stdio: 'inherit',
  cwd: projectDir,
});

child.on('error', (err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
