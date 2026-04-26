require('dotenv').config();
const mysql = require('mysql2/promise');

async function clearStaleLocks() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
  });

  try {
    const [transactions] = await connection.query(
      'SELECT trx_id, trx_mysql_thread_id, trx_started, trx_state FROM information_schema.innodb_trx'
    );

    if (transactions.length === 0) {
      console.log('No active InnoDB transactions found.');
      return;
    }

    console.log('Active transactions:', transactions);

    for (const trx of transactions) {
      const threadId = trx.trx_mysql_thread_id;
      // In local dev, force-kill stale transaction owners older than ~10 seconds.
      const [procRows] = await connection.query('SHOW FULL PROCESSLIST');
      const proc = procRows.find((p) => p.Id === threadId);
      const trxAgeSeconds = Math.floor(
        (Date.now() - new Date(trx.trx_started).getTime()) / 1000
      );

      if (proc && (proc.Command === 'Sleep' || trxAgeSeconds > 10)) {
        await connection.query(`KILL ${threadId}`);
        console.log(`Killed stale transaction thread: ${threadId}`);
      } else {
        console.log(`Skipped thread ${threadId} (not sleeping or not found).`);
      }
    }
  } finally {
    await connection.end();
  }
}

clearStaleLocks().catch((error) => {
  console.error('Failed to clear stale locks:', error.message);
  process.exit(1);
});
