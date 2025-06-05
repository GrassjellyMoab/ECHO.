import firebase_admin
from firebase_admin import credentials 
from firebase_admin import firestore
from firebase_admin import auth
import argparse
import pandas as pd
from datetime import datetime

parser = argparse.ArgumentParser()

# Use a serviced account 
cred = credentials.Certificate("echo-d1e60-firebase-adminsdk-fbsvc-967e760980.json")
default_app = firebase_admin.initialize_app(cred)
db = firestore.client()

parser = argparse.ArgumentParser(
    description= "Data uploader for ECHO"
)

parser.add_argument(
    '--collection',
    type=str,
    help='Which collection to insert the records into'
)

parser.add_argument(
    '--input_csv',
    type=str,
    help='Path to input csv file containing the records'
)

def registerusers(df,collection):
    for _, record in df.iterrows():
        
        # Insert user into firebase authentication 
        user = auth.create_user(
            email=record['email'],
            phone_number=f"+65{str(record['phone_number']).strip()}",
            password=record.get('password','testing1234'),
            email_verified = False,
            disabled=False)
        print(f"Created user: {record['email']} (UID: {user.uid})")
        # Add user details to the user collection 
        db.collection(collection).document(user.uid).set({
                "username": record['username'],
                "email": record['email'],
                "firstName": record['first_name'],
                "lastName": record['last_name'],
                "phoneNumber": f"+65{str(record['phone_number']).strip()}",
                "role": record['role']
            })

# Date conversion: 
def parse_date(val):
    date = datetime.strptime(val + "-2025", "%d-%b-%Y")  # Add the year in
    return date.date().isoformat()

# Add Leaderboard details to leaderboard collection 
def leaderboardtable(df, collection):
    for _, record in df.iterrows():
        db.collection(collection).document(record['uid']).set({
            "points": record['points'],
            "start_date": parse_date(record['start_date']),
            "end_date": parse_date(record['end_date']),
        })
    print(f'Sucessfully created new leaderboard table.')

# Parse Argument 
args = parser.parse_args()
collection = args.collection 
ds = args.input_csv
df = pd.read_csv(ds)

if (collection =='users'):
    registerusers(df,collection)
elif(collection =='leaderboard'):
    leaderboardtable(df,collection)
## to add more 
else: 
    print("Please enter a valid collection name")
