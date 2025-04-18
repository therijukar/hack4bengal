import os
import json
import uuid
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import numpy as np

# Import ML models and processors
from models.text_analyzer import TextAnalyzer
from models.image_analyzer import ImageAnalyzer
from models.spam_detector import SpamDetector

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20MB max-limit

# Initialize models
try:
    text_analyzer = TextAnalyzer()
    image_analyzer = ImageAnalyzer()
    spam_detector = SpamDetector()
    
    logger.info("All models loaded successfully")
except Exception as e:
    logger.error(f"Error initializing models: {str(e)}")
    raise

# Helper functions
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mov'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_emergency_score(text_severity, media_severity, user_credibility):
    """
    Calculate emergency score based on the formula:
    Score = (text_severity × 0.4) + (media_severity × 0.5) + (user_credibility × 0.1)
    """
    return (text_severity * 0.4) + (media_severity * 0.5) + (user_credibility * 0.1)

def save_uploaded_file(file):
    """Save uploaded file to disk and return the path"""
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Generate unique filename to prevent collisions
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        return file_path
    return None

# Routes
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'models': {
            'text_analyzer': text_analyzer.is_loaded(),
            'image_analyzer': image_analyzer.is_loaded(),
            'spam_detector': spam_detector.is_loaded(),
        }
    })

@app.route('/analyze', methods=['POST'])
def analyze_report():
    """
    Analyze report for emergency scoring
    
    Expected JSON structure:
    {
        "text": "Report description text",
        "user_credibility": 1.0,  # Optional, defaults to 1.0
        "report_history": []  # Optional, previous reports by the same user
    }
    
    Plus optional files uploaded as multipart/form-data
    """
    try:
        # Extract text data
        if request.content_type and 'multipart/form-data' in request.content_type:
            text = request.form.get('text', '')
            user_credibility = float(request.form.get('user_credibility', 1.0))
            report_history = json.loads(request.form.get('report_history', '[]'))
        else:
            data = request.get_json()
            text = data.get('text', '')
            user_credibility = float(data.get('user_credibility', 1.0))
            report_history = data.get('report_history', [])
        
        # Check if there's enough data to analyze
        if not text and not request.files:
            return jsonify({
                'error': 'No text or media provided for analysis'
            }), 400
        
        # Spam detection
        spam_probability = spam_detector.predict(text, report_history)
        is_spam = spam_probability > 0.8  # Threshold for spam classification
        
        # If identified as spam, return early with low score
        if is_spam:
            return jsonify({
                'emergency_score': 0.0,
                'text_severity': 0.0,
                'media_severity': 0.0,
                'user_credibility': user_credibility,
                'spam_probability': float(spam_probability),
                'is_spam': True,
                'analysis_timestamp': datetime.now().isoformat()
            })
        
        # Text analysis
        text_severity = text_analyzer.analyze(text) if text else 0.0
        
        # Media analysis
        media_paths = []
        media_severity = 0.0
        
        if request.files:
            media_files = request.files.getlist('media')
            for file in media_files:
                file_path = save_uploaded_file(file)
                if file_path:
                    media_paths.append(file_path)
            
            # Only analyze media if there are valid files
            if media_paths:
                media_severity = image_analyzer.analyze_batch(media_paths)
        
        # Calculate emergency score
        emergency_score = calculate_emergency_score(
            text_severity, 
            media_severity, 
            user_credibility
        )
        
        # Prepare response
        response = {
            'emergency_score': float(emergency_score),
            'text_severity': float(text_severity),
            'media_severity': float(media_severity),
            'user_credibility': float(user_credibility),
            'spam_probability': float(spam_probability),
            'is_spam': is_spam,
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Analysis complete: {json.dumps(response)}")
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error during analysis: {str(e)}")
        return jsonify({
            'error': 'An error occurred during analysis',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('DEBUG', 'False').lower() == 'true') 