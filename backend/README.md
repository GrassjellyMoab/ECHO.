# Steps to run the backend

1. Start the server:

       uvicorn main:app --reload

2. Make a POST request to /review:

        curl -X POST "<http://localhost:8000/review>" \
        -H "Content-Type: application/json" \
        -d '{
            "comment": "This is completely wrong and makes no sense!",
            "thread_id": "your-thread-id-here"
        }'

3. Response will be:

        {
            "success": true,
            "result": {
            "comment": "This is completely wrong and makes no sense!",
            "ai_verdict": "The AI verdict from the thread",
            "similarity_score": 0.123,
            "contradiction_score": 0.876,
            "is_flagged": true,
            "reason": "High contradiction with AI verdict"
            }
        }
