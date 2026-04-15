import 'dotenv/config';
import app from './app';

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║       DiabeControl API — Backend       ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n  Servidor:     http://localhost:${PORT}`);
  console.log(`  Documentação: http://localhost:${PORT}/docs`);
  console.log(`  Health:       http://localhost:${PORT}/health`);
  console.log(`  Ambiente:     ${process.env.NODE_ENV ?? 'development'}`);
  console.log('\n  Pressione CTRL+C para encerrar\n');
});

// ─── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('\nEncerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nEncerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado.');
    process.exit(0);
  });
});

export default server;
