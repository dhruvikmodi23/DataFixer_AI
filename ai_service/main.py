from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import json
import traceback
import time
from typing import List, Dict, Any, Optional, Union
from transformers import AutoModelForCausalLM, AutoTokenizer
import re

app = FastAPI(title="DataFixer AI Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load AI model for text repair
try:
    model_name = "gpt2"  # Using a smaller model for demonstration
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)
    print(f"Loaded model: {model_name}")
except Exception as e:
    print(f"Error loading model: {e}")
    # Fallback to rule-based repair if model loading fails
    model = None
    tokenizer = None

class FileRequest(BaseModel):
    content: str
    fileType: str

class ChangeRecord(BaseModel):
    line: int
    description: str
    before: Optional[str] = None
    after: Optional[str] = None

class FileResponse(BaseModel):
    success: bool
    fixedContent: Optional[str] = None
    changes: Optional[List[ChangeRecord]] = None
    error: Optional[str] = None

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/api/fix", response_model=FileResponse)
async def fix_file(request: FileRequest):
    try:
        content = request.content
        file_type = request.fileType.lower()
        
        # Add artificial delay for demo purposes
        time.sleep(2)
        
        if file_type == "csv":
            return fix_csv(content)
        elif file_type == "json":
            return fix_json(content)
        else:
            return FileResponse(
                success=False,
                error=f"Unsupported file type: {file_type}"
            )
    except Exception as e:
        traceback_str = traceback.format_exc()
        print(f"Error processing file: {traceback_str}")
        return FileResponse(
            success=False,
            error=f"Error processing file: {str(e)}"
        )

def fix_csv(content: str) -> FileResponse:
    # Common CSV errors to fix
    changes = []
    lines = content.split('\n')
    fixed_lines = []
    
    # Track if we need to add missing quotes
    missing_quotes = False
    
    # Check for common delimiter issues
    delimiter = ','
    if content.count(';') > content.count(','):
        delimiter = ';'
    
    for i, line in enumerate(lines):
        original_line = line
        fixed_line = line
        
        # Fix 1: Handle uneven number of quotes
        quote_count = line.count('"')
        if quote_count % 2 != 0:
            fixed_line = fixed_line.replace('"', '')
            changes.append(ChangeRecord(
                line=i+1,
                description="Removed unbalanced quotes",
                before=original_line,
                after=fixed_line
            ))
        
        # Fix 2: Fix missing commas between fields
        if delimiter in fixed_line:
            # Look for patterns like "value"value instead of "value",value
            fixed_line = re.sub(r'([^' + delimiter + '])"([^' + delimiter + '])', r'\1"' + delimiter + r'\2', fixed_line)
            if fixed_line != original_line and fixed_line != line:
                changes.append(ChangeRecord(
                    line=i+1,
                    description=f"Added missing {delimiter} between fields",
                    before=original_line,
                    after=fixed_line
                ))
        
        # Fix 3: Handle inconsistent delimiters
        if delimiter == ',' and ';' in fixed_line:
            fixed_line = fixed_line.replace(';', ',')
            if fixed_line != original_line and fixed_line != line:
                changes.append(ChangeRecord(
                    line=i+1,
                    description="Replaced semicolons with commas",
                    before=original_line,
                    after=fixed_line
                ))
        
        fixed_lines.append(fixed_line)
    
    # Try to parse with pandas to catch any remaining issues
    try:
        df = pd.read_csv(pd.StringIO('\n'.join(fixed_lines)), delimiter=delimiter)
        # If successful, convert back to CSV
        fixed_content = df.to_csv(index=False)
        
        # Add a change record if pandas fixed additional issues
        if fixed_content != '\n'.join(fixed_lines):
            changes.append(ChangeRecord(
                line=0,
                description="Fixed structural CSV issues",
                before=content,
                after=fixed_content
            ))
    except Exception as e:
        # If pandas fails, return our best attempt
        fixed_content = '\n'.join(fixed_lines)
    
    return FileResponse(
        success=True,
        fixedContent=fixed_content,
        changes=changes
    )

def fix_json(content: str) -> FileResponse:
    changes = []
    
    # Common JSON errors to fix
    try:
        # First try to parse as is
        json.loads(content)
        # If it works, no changes needed
        return FileResponse(
            success=True,
            fixedContent=content,
            changes=[]
        )
    except json.JSONDecodeError as e:
        # Get error details
        error_msg = str(e)
        line_no = getattr(e, 'lineno', 0)
        col_no = getattr(e, 'colno', 0)
        
        # Fix common JSON errors
        fixed_content = content
        
        # Fix 1: Missing quotes around keys
        fixed_content = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)(\s*:)', r'\1"\2"\3', fixed_content)
        
        # Fix 2: Trailing commas in arrays/objects
        fixed_content = re.sub(r',(\s*[\]}])', r'\1', fixed_content)
        
        # Fix 3: Missing quotes around string values
        fixed_content = re.sub(r':\s*([a-zA-Z][a-zA-Z0-9_]*)\s*([,}])', r': "\1"\2', fixed_content)
        
        # Fix 4: Single quotes instead of double quotes
        fixed_content = fixed_content.replace("'", '"')
        
        # Record changes if we made any
        if fixed_content != content:
            changes.append(ChangeRecord(
                line=line_no,
                description=f"Fixed JSON syntax error: {error_msg}",
                before=content,
                after=fixed_content
            ))
        
        # Try to parse the fixed content
        try:
            parsed = json.loads(fixed_content)
            # If successful, pretty print it
            fixed_content = json.dumps(parsed, indent=2)
            return FileResponse(
                success=True,
                fixedContent=fixed_content,
                changes=changes
            )
        except json.JSONDecodeError:
            # If still failing, try AI-based repair if model is available
            if model and tokenizer:
                try:
                    # Use AI model to suggest fixes
                    prompt = f"Fix this invalid JSON:\n{content}\n\nValid JSON:"
                    inputs = tokenizer(prompt, return_tensors="pt")
                    outputs = model.generate(
                        inputs["input_ids"],
                        max_length=1024,
                        temperature=0.7,
                        top_p=0.9,
                        do_sample=True
                    )
                    ai_suggestion = tokenizer.decode(outputs[0], skip_special_tokens=True)
                    
                    # Extract just the JSON part from the response
                    json_match = re.search(r'Valid JSON:(.*?)($|```)', ai_suggestion, re.DOTALL)
                    if json_match:
                        ai_fixed = json_match.group(1).strip()
                        # Verify it's valid JSON
                        try:
                            json.loads(ai_fixed)
                            changes.append(ChangeRecord(
                                line=0,
                                description="Used AI to fix complex JSON issues",
                                before=content,
                                after=ai_fixed
                            ))
                            return FileResponse(
                                success=True,
                                fixedContent=ai_fixed,
                                changes=changes
                            )
                        except:
                            pass
                except Exception as ai_error:
                    print(f"AI repair failed: {ai_error}")
            
            # If all else fails
            return FileResponse(
                success=False,
                error=f"Could not fix JSON: {error_msg}"
            )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
