from sentence_transformers import SentenceTransformer, util
from transformers import pipeline
import firebase_admin
from firebase_admin import credentials, firestore

# Set up firebase credentials 
if not firebase_admin._apps:
    cred = credentials.Certificate('echo-d1e60-firebase-adminsdk-fbsvc-967e760980.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

# # Load models
model = SentenceTransformer('all-MiniLM-L6-v2')
nli = pipeline("text-classification", model="roberta-large-mnli")

# Fetch all threads 
threads = db.collection("threads").stream()

for thread in threads:
    thread_data = thread.to_dict()
    thread_id = thread.id
    ai_verdict = thread_data.get("ai_verdict")
    if not ai_verdict:
        continue

    # Get all the comments for these threads 
    comments_query = db.collection("comments").where("tid", "==", thread_id).stream()
    comments = []
    comment_refs = []

    for c in comments_query:
        c_dict = c.to_dict()
        comments.append(c_dict.get("text", ""))
        comment_refs.append(c.reference)

    if not comments:
        continue

    ai_embed = model.encode(ai_verdict, convert_to_tensor=True)
    comment_embeds = model.encode(comments, convert_to_tensor=True)
    similarities = util.pytorch_cos_sim(ai_embed, comment_embeds)[0]

    nli_results = nli([{"text": ai_verdict, "text_pair": c} for c in comments], return_all_scores=True)



    for i, comment in enumerate(comments):
        sim_score = similarities[i].item()
        contradiction_score = next(
            x['score'] for x in nli_results[i] if x['label'].upper() == 'CONTRADICTION'
        )
        # Ignore the composite risk 
        composite_risk = 0.6 * contradiction_score + 0.4 * (1 - sim_score)

        print(f"AI Verdict: {ai_verdict}")
        print(f"Comment: {comment}")
        print(f"Similarity Score: {sim_score:.3f}")
        print(f"Contradiction Score: {contradiction_score:.3f}")
        # print(f"Composite Risk: {composite_risk:.3f}")
        if sim_score < 0.4 or contradiction_score > 0.75:
            print("Flag for review\n")
            comment_refs[i].update({"is_flagged": True})
        else:
            comment_refs[i].update({"is_flagged": False})


