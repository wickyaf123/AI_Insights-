"""
JSON repair utilities for handling malformed AI-generated JSON.
Provides functions to detect, repair, and validate JSON from Gemini responses.
"""
import json
import re
from typing import Optional, Dict, Any


def repair_json(text: str) -> Optional[str]:
    """
    Attempt to repair malformed JSON text.
    
    Args:
        text: Potentially malformed JSON string
        
    Returns:
        Repaired JSON string, or None if unrepairable
    """
    if not text or not text.strip():
        return None
    
    # Remove any markdown code blocks
    text = re.sub(r'^```json\s*', '', text)
    text = re.sub(r'^```\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    
    # Extract JSON if wrapped in text
    first_brace = text.find('{')
    if first_brace == -1:
        return None
    
    # Find the last closing brace
    last_brace = text.rfind('}')
    if last_brace == -1:
        # No closing brace found, try to add it
        text = text[first_brace:] + '}'
    else:
        text = text[first_brace:last_brace + 1]
    
    # Clean up common issues
    text = clean_json_text(text)
    
    # Try to fix structural issues
    text = fix_json_structure(text)
    
    return text


def clean_json_text(text: str) -> str:
    """
    Clean up common text issues in JSON.
    
    Args:
        text: JSON string to clean
        
    Returns:
        Cleaned JSON string
    """
    # Replace smart quotes with regular quotes
    text = text.replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u201C', '"').replace('\u201D', '"')
    
    # Replace em/en dashes
    text = text.replace('\u2013', '-').replace('\u2014', '-')
    
    # Replace ellipsis
    text = text.replace('\u2026', '...')
    
    # Replace non-breaking spaces
    text = text.replace('\u00A0', ' ')
    
    return text


def fix_json_structure(text: str) -> str:
    """
    Attempt to fix structural JSON issues.
    
    Args:
        text: JSON string with potential structural issues
        
    Returns:
        JSON string with attempted fixes
    """
    # Remove trailing commas before closing braces/brackets
    text = re.sub(r',(\s*[}\]])', r'\1', text)
    
    # Count braces and brackets to determine what's missing
    open_braces = text.count('{')
    close_braces = text.count('}')
    open_brackets = text.count('[')
    close_brackets = text.count(']')
    
    # Add missing closing braces
    if open_braces > close_braces:
        missing = open_braces - close_braces
        # Try to determine where to add them based on indentation or structure
        text = text.rstrip() + ('\n  ' * (missing - 1) + '\n}' * missing)
    
    # Add missing closing brackets
    if open_brackets > close_brackets:
        missing = open_brackets - close_brackets
        text = text.rstrip() + (']' * missing)
    
    return text


def validate_and_repair_json(text: str) -> Optional[Dict[str, Any]]:
    """
    Validate JSON and attempt repair if invalid.
    
    Args:
        text: JSON string to validate and repair
        
    Returns:
        Parsed JSON dict, or None if unrepairable
    """
    # First try parsing as-is
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Try basic repair
    repaired = repair_json(text)
    if not repaired:
        return None
    
    # Try multiple repair attempts
    max_attempts = 5
    for attempt in range(max_attempts):
        try:
            parsed = json.loads(repaired)
            print(f"[JSON Repair] ✅ Successfully parsed JSON after {attempt + 1} attempt(s)")
            return parsed
        except json.JSONDecodeError as e:
            print(f"[JSON Repair] Attempt {attempt + 1}/{max_attempts} failed: {e.msg} at position {e.pos}")
            
            # Try more aggressive repairs
            new_repaired = aggressive_repair(repaired, e)
            
            # If aggressive repair returned something different, use it
            if new_repaired and new_repaired != repaired:
                repaired = new_repaired
            else:
                # If no progress, try alternative strategies
                if attempt < max_attempts - 1:
                    # Try removing the problematic character and nearby content
                    if e.pos < len(repaired):
                        # Remove character at error position
                        repaired = repaired[:e.pos] + repaired[e.pos + 1:]
                        # Also try to fix structure
                        repaired = fix_json_structure(repaired)
                else:
                    # Last attempt: truncate to last valid content
                    print(f"[JSON Repair] Final attempt: truncating to preserve valid data")
                    break
    
    # If all repairs failed, return None
    print(f"[JSON Repair] ❌ All repair attempts exhausted")
    return None


def aggressive_repair(text: str, error: json.JSONDecodeError) -> Optional[str]:
    """
    Attempt aggressive repairs based on the specific error.
    
    Args:
        text: JSON string with errors
        error: The JSONDecodeError with position information
        
    Returns:
        Repaired JSON string, or None
    """
    error_pos = error.pos
    error_msg = str(error.msg).lower()
    
    # Handle unterminated string
    if 'unterminated string' in error_msg:
        # Try to close the string and complete the JSON
        before_error = text[:error_pos]
        
        # Count quotes to see if we need to close a string
        quote_count = before_error.count('"') - before_error.count('\\"')
        
        if quote_count % 2 == 1:  # Odd number means unclosed string
            # Close the string and try to complete the structure
            text = before_error + '"}\n  }\n}'
            return text
    
    # Handle missing comma or bracket in array
    if "expected ',' or ']'" in error_msg or "expected ',' or '}'" in error_msg:
        # Look at the character at error position
        if error_pos < len(text):
            char_at_error = text[error_pos]
            before = text[:error_pos]
            after = text[error_pos:]
            
            # Check if we need to add a comma before this character
            # Look back to see what came before (skip whitespace)
            before_stripped = before.rstrip()
            if before_stripped:
                last_char = before_stripped[-1]
                
                # If previous element ended properly, we need a comma
                if last_char in ['"', '}', ']'] and char_at_error in ['"', '{', '[']:
                    print(f"[JSON Repair] Adding missing comma at position {error_pos}")
                    # Insert comma after the previous element
                    return before_stripped + ',' + before[len(before_stripped):] + after
                
                # If we have a newline character or other invalid character at error position
                if char_at_error in ['\n', '\r', '\t'] or ord(char_at_error) < 32:
                    print(f"[JSON Repair] Removing whitespace/control character at position {error_pos}")
                    # Try adding comma and removing the bad character
                    return before_stripped + ',' + after[1:].lstrip()
            
            # If we're missing a comma, try adding it
            if char_at_error in ['"', '{', '[']:
                print(f"[JSON Repair] Adding missing comma at position {error_pos}")
                return before + ',' + after
            
            # If we have a malformed character, try removing it
            if char_at_error not in [',', ']', '}', '"', ' ', '\n', '\r', '\t']:
                print(f"[JSON Repair] Removing malformed character '{char_at_error}' at position {error_pos}")
                return before + after[1:]
            
            # Try to find and fix the actual issue by looking at context
            # Sometimes the error position is not exactly where the problem is
            context_size = 50
            context_start = max(0, error_pos - context_size)
            context = text[context_start:error_pos + context_size]
            
            # Look for patterns like:  "value"\n\n  "key":
            # This indicates a missing comma
            pattern_check = before[max(0, error_pos - 20):error_pos]
            if pattern_check.rstrip().endswith('"') and after.lstrip().startswith('"'):
                print(f"[JSON Repair] Pattern detected: missing comma between string values")
                whitespace = after[:len(after) - len(after.lstrip())]
                return before.rstrip() + ',' + whitespace + after.lstrip()
            
            # Try truncating at the error and closing properly
            # Look back to find the last complete element
            last_quote = before.rfind('"')
            if last_quote > 0:
                before_last_quote = before[:last_quote + 1]
                # Check if we're in the middle of a player's data
                # Count how many player objects we have
                player_objects = before_last_quote.count('"insights":')
                if player_objects >= 1:
                    # We have at least one player, close properly
                    print(f"[JSON Repair] Truncating at last complete element (preserved {player_objects} player(s))")
                    # Close array and objects properly
                    return before_last_quote + '\n      ]\n    }\n  },\n  "team1": {\n    "insights": [],\n    "strengths": [],\n    "weaknesses": []\n  },\n  "team2": {\n    "insights": [],\n    "strengths": [],\n    "weaknesses": []\n  }\n}'
    
    # Handle unexpected character
    if 'expecting' in error_msg:
        # Try removing characters around the error position
        before = text[:max(0, error_pos - 1)]
        after = text[min(len(text), error_pos + 1):]
        repaired = before + after
        
        # Try adding missing comma if needed
        if error_pos > 0 and error_pos < len(text):
            context_before = text[max(0, error_pos - 10):error_pos]
            context_after = text[error_pos:min(len(text), error_pos + 10)]
            
            # If we're between two string values or objects, might need a comma
            if context_before.rstrip().endswith('"') and context_after.lstrip().startswith('"'):
                return text[:error_pos] + ',' + text[error_pos:]
        
        return repaired
    
    return None


def validate_sports_json_structure(data: Dict[str, Any]) -> bool:
    """
    Validate that the JSON has the expected sports insights structure.
    
    Args:
        data: Parsed JSON dictionary
        
    Returns:
        True if structure is valid, False otherwise
    """
    # Check for required top-level keys
    if 'players' not in data:
        return False
    
    # Validate players structure
    if not isinstance(data['players'], dict):
        return False
    
    # Check optional team structures
    for team_key in ['team1', 'team2']:
        if team_key in data:
            if not isinstance(data[team_key], dict):
                return False
            # Should have insights, strengths, weaknesses
            team_data = data[team_key]
            for field in ['insights', 'strengths', 'weaknesses']:
                if field in team_data and not isinstance(team_data[field], list):
                    return False
    
    return True


def create_fallback_structure() -> Dict[str, Any]:
    """
    Create a fallback JSON structure when repair fails.
    
    Returns:
        Empty but valid sports insights structure
    """
    return {
        "players": {},
        "team1": {
            "insights": [],
            "strengths": [],
            "weaknesses": []
        },
        "team2": {
            "insights": [],
            "strengths": [],
            "weaknesses": []
        }
    }

