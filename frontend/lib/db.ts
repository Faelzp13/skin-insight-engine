import sql from 'mssql';

const sqlConfig: sql.config = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  database: process.env.AZURE_SQL_DATABASE,
  server: process.env.AZURE_SQL_SERVER as string,
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

export async function getConnection() {
  try {
    const pool = await sql.connect(sqlConfig);
    return pool;
  } catch (error) {
    console.error('Erro de conexão com o Azure SQL:', error);
    throw error;
  }
}