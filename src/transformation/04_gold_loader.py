import os
import io
import logging
import urllib.parse
import pandas as pd
from sqlalchemy import create_engine, text
from azure.storage.blob import BlobServiceClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


def get_latest_silver_parquet(conn_str):
    """Encontra e faz o download do arquivo Parquet mais recente da camada Silver."""
    blob_service_client = BlobServiceClient.from_connection_string(conn_str)
    container_client = blob_service_client.get_container_client("silver")

    blobs = list(container_client.list_blobs(name_starts_with="facts/"))
    if not blobs:
        raise FileNotFoundError("Nenhum arquivo parquet encontrado em silver/facts/")

    # Ordena para pegar o arquivo criado mais recentemente
    latest_blob = sorted(blobs, key=lambda b: b.creation_time, reverse=True)[0]
    logging.info(f"Lendo o arquivo mais recente: {latest_blob.name}")

    blob_client = container_client.get_blob_client(latest_blob.name)
    download_stream = blob_client.download_blob()

    # Lê os dados em binário direto da memória para o Pandas
    return pd.read_parquet(io.BytesIO(download_stream.readall()))


def main():
    azure_conn_str = os.getenv("AZURE_CONNECTION_STRING")
    sql_conn_str = os.getenv("AZURE_SQL_CONNECTION_STRING")

    if not azure_conn_str or not sql_conn_str:
        logging.error("Variáveis de ambiente (Connection Strings) ausentes.")
        return

    # 1. Puxar os dados processados do Data Lake
    df = get_latest_silver_parquet(azure_conn_str)

    # 2. Conectar ao Azure SQL Database usando SQLAlchemy
    params = urllib.parse.quote_plus(sql_conn_str)
    engine = create_engine(
        f"mssql+pyodbc:///?odbc_connect={params}",
        fast_executemany=True,
        connect_args={'timeout': 90}
    )

    # 3. Preparar e Atualizar Dimensões (Evitando erros de chaves duplicadas)
    # 3. Preparar Dimensões
    dim_skins = df[['tradeup_id', 'skin']].drop_duplicates().rename(columns={'skin': 'skin_name'})
    dim_markets = df[['market']].drop_duplicates().rename(columns={'market': 'market_name'})

    # engine.begin() já cria a transação segura e faz o commit automático no final
    with engine.begin() as conn:
        # Atualiza dim_markets
        existing_markets = pd.read_sql("SELECT market_name FROM dim_markets", conn)
        new_markets = dim_markets[~dim_markets['market_name'].isin(existing_markets['market_name'])]
        if not new_markets.empty:
            new_markets.to_sql('dim_markets', conn, if_exists='append', index=False)
            logging.info(f"{len(new_markets)} novos mercados adicionados.")

        # Atualiza dim_skins
        existing_skins = pd.read_sql("SELECT tradeup_id FROM dim_skins", conn)
        new_skins = dim_skins[~dim_skins['tradeup_id'].isin(existing_skins['tradeup_id'])]
        if not new_skins.empty:
            new_skins.to_sql('dim_skins', conn, if_exists='append', index=False)
            logging.info(f"{len(new_skins)} novas skins adicionadas.")

        # 4. Preparar e Atualizar Fatos
        fact_df = df[['tradeup_id', 'wear', 'market', 'price', 'timestamp']].copy()
        fact_df.rename(columns={'market': 'market_name', 'timestamp': 'extraction_timestamp'}, inplace=True)
        fact_df['extraction_timestamp'] = pd.to_datetime(fact_df['extraction_timestamp']).dt.strftime(
            '%Y-%m-%d %H:%M:%S')

        logging.info("Limpando preços antigos no banco de dados com TRUNCATE...")
        conn.execute(text("TRUNCATE TABLE fact_current_prices"))

        logging.info("Inserindo os preços atuais atualizados...")
        # Note que agora usamos 'conn' ao invés de 'engine', evitando o Deadlock!
        fact_df.to_sql('fact_current_prices', conn, if_exists='append', index=False, chunksize=2000)

    logging.info("Carga da Camada Gold concluída com sucesso!")


if __name__ == "__main__":
    main()