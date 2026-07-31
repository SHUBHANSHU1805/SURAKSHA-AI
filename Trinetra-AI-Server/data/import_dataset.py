import os
import sqlite3
import pandas as pd
from datetime import datetime

# Set up paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'india_crime_dataset_200k.csv')
DB_PATH = os.path.join(BASE_DIR, 'crime_data.db')

def map_severity(val):
    if val in [4, 5]:
        return 'Low'
    elif val == 6:
        return 'Medium'
    elif val in [7, 8]:
        return 'High'
    else:
        return 'Critical'

def map_status(val):
    if val == 'Open':
        return 'Under Investigation'
    return 'Closed'

def import_data():
    print(f"Reading CSV from {CSV_PATH}...")
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"CSV file not found at {CSV_PATH}")
        
    df = pd.read_csv(CSV_PATH)
    print(f"Loaded {len(df)} records. Starting transformation...")

    # Rename columns to match database schema
    df = df.rename(columns={
        'FIR_ID': 'id',
        'State': 'state',
        'Zone_ID': 'city',
        'Crime_Type': 'crime_type',
        'IPC_Section': 'ipc_section',
        'Severity': 'severity_num',
        'Latitude': 'lat',
        'Longitude': 'lng',
        'Women_Crime_Flag': 'women_crime_flag',
        'Cyber_Crime_Flag': 'cyber_crime_flag',
        'Patrol_Priority': 'patrol_priority'
    })

    # Map text severity and status
    df['severity'] = df['severity_num'].apply(map_severity)
    df['status'] = df['Status'].apply(map_status)
    df.drop(columns=['Status'], inplace=True)

    # Combine Date and Hour to created_at ISO string
    # Date is YYYY-MM-DD, Hour is 0-23
    print("Formatting timestamps...")
    df['created_at'] = df.apply(lambda row: f"{row['Date']}T{int(row['Hour']):02d}:00:00+00:00", axis=1)
    df.drop(columns=['Date', 'Hour'], inplace=True)

    # Convert coordinates to floats, replace any NaN
    df['lat'] = pd.to_numeric(df['lat'], errors='coerce').fillna(19.0760)
    df['lng'] = pd.to_numeric(df['lng'], errors='coerce').fillna(72.8777)
    df['women_crime_flag'] = pd.to_numeric(df['women_crime_flag'], errors='coerce').fillna(0).astype(int)
    df['cyber_crime_flag'] = pd.to_numeric(df['cyber_crime_flag'], errors='coerce').fillna(0).astype(int)

    print(f"Writing to SQLite database at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    
    # Drop table if exists
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS firs")
    conn.commit()

    # Write data
    df.to_sql('firs', conn, if_exists='replace', index=False)
    print("Data inserted successfully. Creating indexes...")

    # Create indexes for optimal search and analytics performance
    cursor.execute("CREATE UNIQUE INDEX idx_firs_id ON firs(id)")
    cursor.execute("CREATE INDEX idx_firs_state ON firs(state)")
    cursor.execute("CREATE INDEX idx_firs_city ON firs(city)")
    cursor.execute("CREATE INDEX idx_firs_crime_type ON firs(crime_type)")
    cursor.execute("CREATE INDEX idx_firs_severity ON firs(severity)")
    cursor.execute("CREATE INDEX idx_firs_status ON firs(status)")
    cursor.execute("CREATE INDEX idx_firs_created_at ON firs(created_at)")
    cursor.execute("CREATE INDEX idx_firs_women ON firs(women_crime_flag)")
    cursor.execute("CREATE INDEX idx_firs_cyber ON firs(cyber_crime_flag)")
    
    conn.commit()
    conn.close()
    print("Indexing completed. SQLite database is ready!")

if __name__ == '__main__':
    import_data()
