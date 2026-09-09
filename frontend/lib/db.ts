import sql from 'mssql';

const sqlConfig: sql.config = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  database: process.env.AZURE_SQL_DATABASE,
  server: process.env.AZURE_SQL_SERVER as string,
  connectionTimeout: 60000,
  requestTimeout: 60000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// Guarda a conexão globalmente para não estourar o limite do Azure no modo Dev
const globalForSql = globalThis as unknown as { connPool: sql.ConnectionPool };

export async function getConnection() {
  try {
    if (!globalForSql.connPool) {
      globalForSql.connPool = await sql.connect(sqlConfig);
    }
    return globalForSql.connPool;
  } catch (error) {
    console.error('Erro de conexão com o Azure SQL:', error);
    throw error;
  }
}