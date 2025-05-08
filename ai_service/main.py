from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import json
import traceback
import re
import csv
from io import StringIO
from typing import List, Dict, Any, Optional, Union
from collections import Counter
from statistics import mode
from datetime import datetime

app = FastAPI(title="DataFixer Pro Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FileRequest(BaseModel):
    content: str
    fileType: str
    impute_strategy: Optional[str] = "auto"  # auto, median, mode, zero, empty

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
    return {"status": "healthy", "optimized": True}

@app.post("/api/fix", response_model=FileResponse)
async def fix_file(request: FileRequest):
    try:
        content = request.content.strip()
        if not content:
            return FileResponse(success=False, error="Empty content provided")
            
        file_type = request.fileType.lower()
        
        if file_type == "csv":
            return fix_csv(content, request.impute_strategy)
        elif file_type == "json":
            return fix_json(content, request.impute_strategy)
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

def detect_delimiter(content: str) -> str:
    """Optimized delimiter detection with priority"""
    sample = content[:2048]  # Check first 2KB
    delimiters = [',', ';', '\t', '|', ':']
    for delim in delimiters:
        if sample.count(delim) > sample.count('\n'):
            return delim
    return ','  # default

def analyze_column_stats(df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
    """Analyze all columns at once to determine optimal fill values"""
    stats = {}
    for col in df.columns:
        non_null = df[col].dropna()
        col_stats = {
            'dtype': str(df[col].dtype),
            'null_count': df[col].isna().sum(),
            'unique_count': non_null.nunique(),
            'sample_values': non_null.head(2).tolist() if not non_null.empty else []
        }
        
        if pd.api.types.is_numeric_dtype(df[col]):
            col_stats.update({
                'median': non_null.median() if not non_null.empty else None,
                'mean': non_null.mean() if not non_null.empty else None,
                'min': non_null.min() if not non_null.empty else None,
                'max': non_null.max() if not non_null.empty else None
            })
        
        if len(non_null) > 0:
            try:
                col_stats['mode'] = mode(non_null.dropna().astype(str).tolist())
            except:
                col_stats['mode'] = non_null.iloc[0]
        
        stats[col] = col_stats
    return stats

def get_fill_values(stats: Dict[str, Dict[str, Any]], strategy: str) -> Dict[str, Any]:
    """Determine fill values based on global analysis"""
    fill_values = {}
    for col, col_stats in stats.items():
        if col_stats['null_count'] == 0:
            continue
            
        if strategy == "median" and 'median' in col_stats:
            fill_values[col] = col_stats['median']
        elif strategy == "mode" and 'mode' in col_stats:
            fill_values[col] = col_stats['mode']
        elif strategy == "zero" and pd.api.types.is_numeric_dtype(col_stats['dtype']):
            fill_values[col] = 0
        elif strategy == "empty":
            fill_values[col] = ""
        else:  # auto
            if pd.api.types.is_numeric_dtype(col_stats['dtype']):
                fill_values[col] = col_stats.get('median', 0)
            else:
                fill_values[col] = col_stats.get('mode', "")
    return fill_values

def fix_csv(content: str, strategy: str) -> FileResponse:
    try:
        # Parse CSV with optimized settings
        df = pd.read_csv(
            StringIO(content),
            delimiter=detect_delimiter(content),
            engine='c',
            na_values=['', 'NA', 'NULL', 'NaN', 'None', 'none', 'null', '?', '-'],
            keep_default_na=True,
            true_values=['TRUE', 'True', 'true', 'T', 't', '1', 'YES', 'Yes', 'yes', 'Y', 'y'],
            false_values=['FALSE', 'False', 'false', 'F', 'f', '0', 'NO', 'No', 'no', 'N', 'n'],
            skipinitialspace=True,
            dtype=None,
            parse_dates=True,
            infer_datetime_format=True
        )
        
        # First pass: analyze all columns
        stats = analyze_column_stats(df)
        fill_values = get_fill_values(stats, strategy)
        
        # Generate changes report
        changes = []
        for col, fill_val in fill_values.items():
            null_count = stats[col]['null_count']
            changes.append(ChangeRecord(
                line=0,
                description=f"Imputed {null_count} nulls in '{col}' with {fill_val} ({strategy})",
                before=f"{null_count} nulls",
                after=str(fill_val)
            ))
        
        # Fill all missing values in one operation
        if fill_values:
            df = df.fillna(fill_values)
        
        # Convert back to CSV with optimized settings
        with StringIO() as buffer:
            df.to_csv(
                buffer,
                index=False,
                encoding='utf-8',
                quoting=csv.QUOTE_MINIMAL,
                quotechar='"',
                escapechar='\\' if any('"' in str(x) for x in df.values.ravel()) else None
            )
            fixed_content = buffer.getvalue()
        
        return FileResponse(
            success=True,
            fixedContent=fixed_content,
            changes=changes
        )
    except Exception as e:
        return FileResponse(
            success=False,
            error=f"CSV processing failed: {str(e)}"
        )

def analyze_json_structure(data: Any) -> Dict[str, Any]:
    """Analyze JSON structure to determine value types and patterns"""
    if isinstance(data, dict):
        return {k: analyze_json_structure(v) for k, v in data.items()}
    elif isinstance(data, list):
        if data:
            return [analyze_json_structure(data[0])]  # Just analyze first element for patterns
        return []
    else:
        return {
            'type': type(data).__name__,
            'value': data
        }

def get_json_fill_value(samples: List[Any], strategy: str) -> Any:
    """Determine fill value based on sample values"""
    if not samples:
        return "" if strategy != "zero" else 0
    
    first_type = type(samples[0])
    
    # Check if all samples are of same type
    consistent_type = all(isinstance(x, first_type) for x in samples)
    
    if strategy == "median" and consistent_type and isinstance(samples[0], (int, float)):
        return np.median(samples)
    elif strategy == "mode":
        try:
            return mode(samples)
        except:
            return samples[0]
    elif strategy == "zero" and consistent_type and isinstance(samples[0], (int, float)):
        return 0
    elif strategy == "empty":
        return ""
    else:  # auto
        if consistent_type:
            if isinstance(samples[0], (int, float)):
                return np.median(samples)
            elif isinstance(samples[0], str):
                return mode(samples) if len(samples) > 1 else samples[0]
            elif isinstance(samples[0], bool):
                return False
        return samples[0] if samples else ""

def json_impute(data: Any, fill_values: Dict[str, Any], path: str = "", changes: List[ChangeRecord] = None) -> Any:
    """Iterative JSON imputation using pre-determined fill values"""
    if changes is None:
        changes = []
    
    if isinstance(data, dict):
        for k, v in data.items():
            current_path = f"{path}.{k}" if path else k
            if v is None and current_path in fill_values:
                changes.append(ChangeRecord(
                    line=0,
                    description=f"Imputed null at {current_path}",
                    before="null",
                    after=str(fill_values[current_path])
                ))
                data[k] = fill_values[current_path]
            else:
                data[k] = json_impute(v, fill_values, current_path, changes)
    elif isinstance(data, list):
        for i, item in enumerate(data):
            current_path = f"{path}[{i}]"
            if item is None and path in fill_values:  # Use parent path for arrays
                changes.append(ChangeRecord(
                    line=0,
                    description=f"Imputed null at {current_path}",
                    before="null",
                    after=str(fill_values[path])
                ))
                data[i] = fill_values[path]
            else:
                data[i] = json_impute(item, fill_values, current_path, changes)
    return data

def collect_null_paths(data: Any, path: str = "", null_paths: Dict[str, List[Any]] = None) -> Dict[str, List[Any]]:
    """Collect all null paths and their context"""
    if null_paths is None:
        null_paths = {}
    
    if isinstance(data, dict):
        for k, v in data.items():
            current_path = f"{path}.{k}" if path else k
            if v is None:
                null_paths.setdefault(current_path, []).append(None)
            else:
                collect_null_paths(v, current_path, null_paths)
    elif isinstance(data, list):
        for i, item in enumerate(data):
            current_path = f"{path}[{i}]"
            if item is None:
                null_paths.setdefault(path, []).append(None)  # Track parent path for arrays
            else:
                collect_null_paths(item, current_path, null_paths)
    return null_paths

def fix_json(content: str, strategy: str) -> FileResponse:
    try:
        parsed = json.loads(content)
        
        # First pass: analyze null locations and their context
        null_paths = collect_null_paths(parsed)
        
        # Second pass: collect sample values for each null path
        sample_values = {}
        for path in null_paths.keys():
            # Get non-null siblings or neighbors
            parts = path.split('.')
            current = parsed
            for part in parts[:-1]:
                if '[' in part and ']' in part:
                    key, idx = part.split('[')
                    idx = int(idx[:-1])
                    current = current[key][idx]
                else:
                    current = current[part]
            
            last_part = parts[-1]
            if '[' in last_part and ']' in last_part:
                # Array case - use parent's other values
                key, idx = last_part.split('[')
                idx = int(idx[:-1])
                samples = [x for x in current[key] if x is not None]
            else:
                # Object case - use other properties
                if isinstance(current, dict):
                    samples = [v for k, v in current.items() if v is not None and k != last_part]
                else:
                    samples = []
            
            sample_values[path] = samples
        
        # Determine fill values for each path
        fill_values = {}
        for path, samples in sample_values.items():
            fill_values[path] = get_json_fill_value(samples, strategy)
        
        # Perform imputation
        fixed_data, changes = json_impute(parsed, fill_values), []
        
        # Generate optimized JSON output
        compact = len(content) > 1024  # Compact if large
        fixed_content = json.dumps(
            fixed_data,
            indent=None if compact else 2,
            ensure_ascii=False,
            separators=(',', ':') if compact else None
        )
        
        return FileResponse(
            success=True,
            fixedContent=fixed_content,
            changes=changes
        )
    except json.JSONDecodeError as e:
        return FileResponse(
            success=False,
            error=f"JSON parsing failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)