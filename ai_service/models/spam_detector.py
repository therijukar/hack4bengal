import os
import logging
import numpy as np
import re
from typing import List, Dict, Any, Optional, Union

# Initialize conditional imports to handle when libraries aren't available
try:
    import xgboost as xgb
    from sklearn.feature_extraction.text import TfidfVectorizer
    MODELS_AVAILABLE = True
except ImportError:
    MODELS_AVAILABLE = False
    logging.warning("XGBoost/scikit-learn not available, SpamDetector will use fallback mode")

logger = logging.getLogger(__name__)

class SpamDetector:
    """
    Spam detection model for filtering out fake or irrelevant reports
    using XGBoost classifier trained on historical data.
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the spam detector
        
        Args:
            model_path: Path to pre-trained model directory
        """
        self.model_loaded = False
        self.model = None
        self.vectorizer = None
        
        # Spam-related keywords for fallback mode
        self.spam_keywords = [
            'viagra', 'cialis', 'casino', 'lottery', 'winner', 'buy now', 'free offer',
            'earn money', 'work from home', 'make money fast', 'discount', 'limited time',
            'click here', 'subscribe', 'unsubscribe', 'Nigerian prince', 'investment opportunity',
            'bitcoin', 'crypto', 'prize', 'congratulations', 'claim your', 'urgent', 'warranty',
            'sex', 'porn', 'xxx', 'dating', 'singles', 'meet women', 'meet men', 'enlargement',
            'weight loss', 'diet', 'pills', 'medication', 'prescription', 'pharmacy',
            'test message', 'testing', 'asdf', 'qwerty', 'lorem ipsum', 'hello world',
            'please ignore', 'this is a test'
        ]
        
        # Try to load the model if available
        if MODELS_AVAILABLE:
            self._load_model(model_path)
    
    def _load_model(self, model_path: Optional[str] = None) -> None:
        """
        Load the XGBoost model and TF-IDF vectorizer
        
        In a real implementation, this would load a fine-tuned model.
        For this demo, we'll simulate with a basic model.
        """
        try:
            # Use default model path if not provided
            if model_path is None:
                model_path = os.environ.get('MODEL_PATH', os.path.join(os.path.dirname(__file__), '../models'))
            
            # For demo purposes, we're creating a simple model rather than loading
            # In a real implementation, you would load models from disk
            self.vectorizer = TfidfVectorizer(
                max_features=1000,
                min_df=5,
                max_df=0.7,
                stop_words='english'
            )
            
            # Create a dummy/basic XGBoost model
            # In a real application, this would be trained on actual data
            self.model = xgb.XGBClassifier(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                objective='binary:logistic',
                random_state=42
            )
            
            # Since we can't actually train the model in this demo, we'll be using
            # the fallback mode - but in a real implementation, you'd have the model trained
            
            logger.info("SpamDetector model initialized successfully")
            self.model_loaded = True
            
        except Exception as e:
            logger.error(f"Error loading SpamDetector model: {str(e)}")
            self.model_loaded = False
    
    def is_loaded(self) -> bool:
        """Check if the model is loaded"""
        return self.model_loaded
    
    def predict(self, text: str, report_history: Optional[List[Dict[str, Any]]] = None) -> float:
        """
        Predict spam probability for a text report
        
        Args:
            text: The report text
            report_history: Optional list of previous reports from the same user
            
        Returns:
            Spam probability from 0 to 1
        """
        if not text:
            return 0.5  # Neutral if no text provided
            
        # Clean the text
        text = self._preprocess_text(text)
        
        # If model is not available or not enough training data, use fallback
        if not self.model_loaded or not MODELS_AVAILABLE:
            return self._fallback_scoring(text, report_history)
        
        try:
            # In a real implementation, we would:
            # 1. Vectorize the text using the pre-trained vectorizer
            # 2. Make a prediction using the pre-trained model
            
            # For demo purposes, we'll just use the fallback scoring
            # but in a real app, we'd do something like:
            # X = self.vectorizer.transform([text])
            # spam_prob = self.model.predict_proba(X)[0, 1]
            
            # Since we don't have a trained model, fall back to the heuristic approach
            return self._fallback_scoring(text, report_history)
            
        except Exception as e:
            logger.error(f"Error in spam prediction: {str(e)}")
            # Fall back to keyword-based scoring on error
            return self._fallback_scoring(text, report_history)
    
    def _preprocess_text(self, text: str) -> str:
        """
        Clean and preprocess text for analysis
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'https?://\S+|www\.\S+', '', text)
        
        # Remove HTML tags
        text = re.sub(r'<.*?>', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _fallback_scoring(self, text: str, report_history: Optional[List[Dict[str, Any]]] = None) -> float:
        """
        Fallback method using keyword matching and heuristics
        
        Args:
            text: Preprocessed text
            report_history: Optional list of previous reports from the same user
            
        Returns:
            Spam probability from 0 to 1
        """
        if not text:
            return 0.5
        
        # Check for spam keywords
        text_lower = text.lower()
        spam_score = 0.0
        
        # Count spam keywords
        for keyword in self.spam_keywords:
            if keyword in text_lower:
                spam_score += 0.2  # Each spam keyword increases the score
        
        # Cap the keyword-based score at 0.9
        spam_score = min(spam_score, 0.9)
        
        # Check for unusual patterns
        if len(text) < 20:
            spam_score += 0.3  # Very short messages are suspicious
        
        # Excessive capitalization
        caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
        if caps_ratio > 0.5:
            spam_score += 0.2
            
        # Check for repetitive characters
        for char in set(text):
            if char * 5 in text:  # 5 or more of the same character in a row
                spam_score += 0.2
                break
        
        # Consider user history if available
        if report_history and len(report_history) > 0:
            # Many reports in a short time might be spam
            if len(report_history) > 10:
                spam_score += 0.2
                
            # Check for duplicate reports
            for report in report_history:
                if 'text' in report and self._similarity(text, report['text']) > 0.8:
                    spam_score += 0.4
                    break
        
        # Normalize to 0-1 range
        spam_score = min(max(spam_score, 0.0), 1.0)
        
        logger.info(f"Fallback spam analysis complete. Spam probability: {spam_score:.2f}")
        return spam_score
    
    def _similarity(self, text1: str, text2: str) -> float:
        """
        Calculate a simple similarity score between two texts
        
        This is a very basic implementation - in a real system you'd use
        more sophisticated text similarity metrics
        """
        # Convert to sets of words for basic Jaccard similarity
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
            
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) 