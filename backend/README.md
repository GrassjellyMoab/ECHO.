# Steps to run the backend

1. Activate virtual environment. The first command is for Windows CMD, the second is for Powershell and the last is for Bash.

       . env/bin/activate
       env\Scripts\activate
       source ./env/bin/activate

2. Install requirements.txt

       pip install -r requirements.txt 

3. Start the server:

       uvicorn main:app --reload

4. Make a POST request to /review:

        curl -X POST "<http://localhost:8000/review>" \
        -H "Content-Type: application/json" \
        -d '{
            "comment": "This is completely wrong and makes no sense!",
            "thread_id": "your-thread-id-here"
        }'

5. Response will be:

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
