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

def threadstable(df,collection):
    for _, record in df.iterrows():
        db.collection(collection).add({
            "uid": record['uid'],
            "title": record['title'],
            "description": record['description'],
            "num_views": record['num_views'],
            "num_comments": record['num_comments'],
            "num_votes": record['num_votes'],
            "read_duration": record['read_duration'],
            "posted_datetime": parse_date(record['posted_datetime']),
            "topics": [topic.strip() for topic in str(record['topics']).split(',') if topic],
            "profile_img": record.get('profile_img') or None,
            "thread_img": record.get('thread_img') or None,
            "is_real": str(record['is_real']).strip().upper() == "TRUE",
            "ai_verdict": record.get('ai_verdict') or None,
            "sources": [s.strip() for s in str(record.get('sources', '')).split(',') if s]
        })
    print(f'Sucessfully created new threads table.')

def topicstable(df,collection):
    for _, record in df.iterrows():
        db.collection(collection).add({
            "topic": record['topic'],
            "is_trending": record['is_trending'],
            "is_rising": record['is_rising'],
            "num_vigilants": record['num_vigilants']
        })
    print(f'Sucessfully created new topics table.')

def votingtable(df,collection):
    for _, record in df.iterrows():
        db.collection(collection).add({
            "uid": record['uid'],
            "tid": record['tid'],
            "topic_id": [topic.strip() for topic in str(record['topic_id']).split(',') if topic],
            "voted_real": [s.strip() for s in str(record['voted_real']).split(',') if s]
        })
    print(f'Sucessfully created new history table.')

def commentstable(df,collection): 
    for _, record in df.iterrows():
        db.collection(collection).add({
            "uid": record['uid'],
            "tid": record['tid'],
            "topic_id": record['topic_id'],
            "text": record['text'],
            "num_replies": record['num_replies'],
            "num_likes": record['num_likes'],
            "is_pinned": record['is_pinned'],
            "date": parse_date(record['datetime']),
            "reply_cid": record['reply_cid']
        })
    print(f'Sucessfully created new comments table.')


# Parse Argument 
args = parser.parse_args()
collection = args.collection 
ds = args.input_csv
df = pd.read_csv(ds)

if (collection =='users'):
    registerusers(df,collection)
elif(collection =='leaderboard'):
    leaderboardtable(df,collection)
elif(collection == 'threads'):
    threadstable(df,collection)
elif(collection == 'topics'):
    topicstable(df,collection)
elif(collection =='vote_history'):
    votingtable(df,collection)
elif(collection =='comments'):
    commentstable(df,collection)
## to add more 
else: 
    print("Please enter a valid collection name")
