from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from transformers import pipeline
import firebase_admin
from firebase_admin import credentials, firestore
from typing import Optional

# Initialize FastAPI app
app = FastAPI(title="Comment Flagging API", version="1.0.0")

# Set up firebase credentials
if not firebase_admin._apps:
    cred = credentials.Certificate('echo-d1e60-firebase-adminsdk-fbsvc-967e760980.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Load models (do this once at startup)
model = SentenceTransformer('all-MiniLM-L6-v2')
nli = pipeline("text-classification", model="roberta-large-mnli")

# Request/Response models
class CommentRequest(BaseModel):
    comment: str
    thread_id: str

class FlaggingResult(BaseModel):
    comment: str
    ai_verdict: str
    similarity_score: float
    contradiction_score: float
    is_flagged: bool
    reason: str

class CommentResponse(BaseModel):
    success: bool
    result: Optional[FlaggingResult] = None
    error: Optional[str] = None

@app.post("/review", response_model=CommentResponse)
async def flag_comment(request: CommentRequest):
    """
    Analyze a comment and determine if it should be flagged based on AI verdict.
    
    Args:
        request: Contains the comment text and thread_id
        
    Returns:
        FlaggingResult with flagging decision and scores
    """
    try:
        # Get the thread data to retrieve AI verdict
        thread_ref = db.collection("threads").document(request.thread_id)
        thread_doc = thread_ref.get()
        
        if not thread_doc.exists:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        thread_data = thread_doc.to_dict()
        ai_verdict = thread_data.get("ai_verdict")
        
        if not ai_verdict:
            raise HTTPException(status_code=400, detail="Thread has no AI verdict")
        
        # Encode AI verdict and comment
        ai_embed = model.encode(ai_verdict, convert_to_tensor=True)
        comment_embed = model.encode([request.comment], convert_to_tensor=True)
        
        # Calculate similarity
        similarity = util.pytorch_cos_sim(ai_embed, comment_embed)[0][0].item()
        
        # Calculate contradiction score using NLI
        nli_result = nli([{"text": ai_verdict, "text_pair": request.comment}], return_all_scores=True)
        contradiction_score = next(
            x['score'] for x in nli_result[0] if x['label'].upper() == 'CONTRADICTION'
        )
        
        # Determine if comment should be flagged
        is_flagged = similarity < 0.4 or contradiction_score > 0.75
        
        # Determine reason for flagging
        reason = ""
        if is_flagged:
            if similarity < 0.4 and contradiction_score > 0.75:
                reason = "Low similarity and high contradiction with AI verdict"
            elif similarity < 0.4:
                reason = "Low similarity with AI verdict"
            elif contradiction_score > 0.75:
                reason = "High contradiction with AI verdict"
        else:
            reason = "No flagging needed"
        
        result = FlaggingResult(
            comment=request.comment,
            ai_verdict=ai_verdict,
            similarity_score=round(similarity, 3),
            contradiction_score=round(contradiction_score, 3),
            is_flagged=is_flagged,
            reason=reason
        )
        
        return CommentResponse(success=True, result=result)
        
    except HTTPException:
        raise
    except Exception as e:
        return CommentResponse(success=False, error=str(e))

@app.post("/review-and-update", response_model=CommentResponse)
async def flag_comment_and_update(request: CommentRequest):
    """
    Analyze a comment, determine if it should be flagged, and update the database.
    
    Args:
        request: Contains the comment text and thread_id
        
    Returns:
        FlaggingResult with flagging decision and scores
    """
    try:
        # First, get the flagging result
        flagging_response = await flag_comment(request)
        
        if not flagging_response.success:
            return flagging_response
        
        result = flagging_response.result
        
        # Find the comment in the database and update it
        comments_query = db.collection("comments").where("tid", "==", request.thread_id).where("text", "==", request.comment).limit(1)
        comments = list(comments_query.stream())
        
        if comments:
            comment_ref = comments[0].reference
            comment_ref.update({"is_flagged": result.is_flagged})
        else:
            # Comment not found in database, but we can still return the analysis
            pass
        
        return CommentResponse(success=True, result=result)
        
    except Exception as e:
        return CommentResponse(success=False, error=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "models_loaded": True}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Comment Flagging API",
        "version": "1.0.0",
        "endpoints": {
            "POST /review": "Analyze a comment for flagging",
            "POST /review-and-update": "Analyze and update comment in database",
            "GET /health": "Health check",
        }
    }
