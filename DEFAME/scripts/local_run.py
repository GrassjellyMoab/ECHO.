from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from defame.fact_checker import FactChecker
from ezmm import Image
import tempfile
import base64
import os
from pydantic import BaseModel
from typing import List, Tuple, Any

app = FastAPI(title="DEFAME Local API")

# Add CORS for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize fact checker
print("Initializing DEFAME FactChecker...")
fact_checker = FactChecker(llm="gpt_4o")
print("FactChecker initialized!")

class ContentRequest(BaseModel):
    content: List[Tuple[str, str]]
    date: str = None

@app.get("/")
def root():
    return "DEFAME Local API is running!"

@app.post("/verify")
def verify_local(request: ContentRequest):
    try:
        print(f"Received request: {request}")
        
        content_list = request.content
        
        # Convert content format to DEFAME format
        claim_parts = []
        temp_files = []
        
        for item in content_list:
            if len(item) != 2:
                continue
                
            content_type, data = item
            
            if content_type == "text":
                claim_parts.append(data)
            elif content_type == "image":
                try:
                    # Decode base64 image
                    image_data = base64.b64decode(data)
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
                        tmp.write(image_data)
                        tmp_path = tmp.name
                        temp_files.append(tmp_path)
                    claim_parts.append(Image(tmp_path))
                except Exception as e:
                    print(f"Error processing image: {e}")
                    claim_parts.append("IMAGE_ERROR")
        
        print(f"Processed claim parts: {len(claim_parts)} items")
        
        # Run fact check
        print("Running fact check...")
        report, _ = fact_checker.verify_claim(claim_parts)
        print("Fact check completed!")
        
        # Clean up temp files
        for tmp_path in temp_files:
            try:
                os.unlink(tmp_path)
            except:
                pass
        
        # Convert report to string and create response
        report_str = str(report)
        print(f"Report: {report_str[:200]}...")
        
        # Simple response format
        return {
            "job_id": "local_job_123",
            "status": "COMPLETED",
            "claims": {
                "0": {
                    "claim_id": "local_job_123/0",
                    "data": content_list,
                    "verdict": "SUPPORTED",  # You can parse this from report_str
                    "justification": [["text", report_str]]
                }
            }
        }
        
    except Exception as e:
        print(f"Error in verify_local: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

if __name__ == "__main__":
    print("="*50)
    print("DEFAME Local API Server")
    print("="*50)
    print("Starting server on http://0.0.0.0:3004")
    
    uvicorn.run(app, host="0.0.0.0", port=3004)