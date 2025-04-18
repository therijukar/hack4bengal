import os
import logging
import numpy as np
from typing import List, Dict, Any, Optional, Union
import re

# Initialize conditional imports to handle when TensorFlow/transformers aren't available
try:
    import tensorflow as tf
    from transformers import DistilBertTokenizer, TFDistilBertModel
    MODELS_AVAILABLE = True
except ImportError:
    MODELS_AVAILABLE = False
    logging.warning("TensorFlow/Transformers not available, TextAnalyzer will use fallback mode")

logger = logging.getLogger(__name__)

class TextAnalyzer:
    """
    Text analysis model for violence detection and severity scoring
    using DistilBERT for embedding and a custom classifier.
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the text analyzer
        
        Args:
            model_path: Path to pre-trained model directory
        """
        self.model_loaded = False
        self.tokenizer = None
        self.model = None
        self.classifier = None
        
        # Violence-related keywords for fallback mode
        self.violence_keywords = {
            'high': [
                'murder', 'killing', 'death', 'gun', 'shoot', 'shot', 'knife', 'stab', 
                'blood', 'weapon', 'attack', 'kill', 'die', 'dead', 'assault', 'beaten',
                'injury', 'injured', 'wound', 'wounded', 'emergency', 'urgent', 'immediate',
                'severe', 'serious', 'critical', 'life-threatening', 'dangerous', 'lethal',
                'firearm', 'bleeding', 'blood', 'threat', 'threatened', 'suicide', 'homicide'
            ],
            'medium': [
                'fight', 'hit', 'punch', 'kick', 'beat', 'assault', 'abuse', 'hurt', 
                'pain', 'suffer', 'victim', 'violent', 'harassment', 'stalking', 'follow',
                'threaten', 'intimidate', 'fear', 'scared', 'afraid', 'unsafe', 'danger',
                'bruise', 'harm', 'damage', 'physical', 'attack', 'aggressive', 'aggression'
            ],
            'low': [
                'argument', 'dispute', 'conflict', 'disagreement', 'verbal', 'yell', 'shout',
                'scream', 'insult', 'offensive', 'inappropriate', 'uncomfortable', 'uneasy',
                'worried', 'concern', 'suspicious', 'strange', 'odd', 'unusual', 'disturbing',
                'cyber', 'online', 'message', 'text', 'social media', 'post', 'comment'
            ]
        }
        
        # Try to load the model if available
        if MODELS_AVAILABLE:
            self._load_model(model_path)
    
    def _load_model(self, model_path: Optional[str] = None) -> None:
        """
        Load the DistilBERT model and classifier
        
        In a real implementation, this would load a fine-tuned model.
        For this demo, we'll simulate with the base model and a simplified classifier.
        """
        try:
            # Use default model path if not provided
            if model_path is None:
                model_path = os.environ.get('MODEL_PATH', os.path.join(os.path.dirname(__file__), '../models'))
            
            # For demo purposes, we're using the base model
            # In a real implementation, you would load a fine-tuned model from disk
            self.tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
            self.model = TFDistilBertModel.from_pretrained('distilbert-base-uncased')
            
            # Simulate loading a classifier - in reality this would be a trained classifier
            # Here we're just creating a simple layer for demonstration
            self.classifier = tf.keras.Sequential([
                tf.keras.layers.Dense(256, activation='relu'),
                tf.keras.layers.Dropout(0.2),
                tf.keras.layers.Dense(1, activation='sigmoid')
            ])
            
            logger.info("TextAnalyzer model loaded successfully")
            self.model_loaded = True
            
        except Exception as e:
            logger.error(f"Error loading TextAnalyzer model: {str(e)}")
            self.model_loaded = False
    
    def is_loaded(self) -> bool:
        """Check if the model is loaded"""
        return self.model_loaded
    
    def analyze(self, text: str) -> float:
        """
        Analyze text for violence severity
        
        Args:
            text: The text to analyze
            
        Returns:
            Severity score from 0 to 10
        """
        if not text:
            return 0.0
            
        # Clean the text
        text = self._preprocess_text(text)
        
        # If model is not available, use fallback keyword-based scoring
        if not self.model_loaded or not MODELS_AVAILABLE:
            return self._fallback_scoring(text)
        
        try:
            # Tokenize the text
            inputs = self.tokenizer(
                text,
                return_tensors="tf",
                truncation=True,
                max_length=512,
                padding="max_length"
            )
            
            # Get embeddings from DistilBERT
            outputs = self.model(inputs)
            embeddings = outputs.last_hidden_state[:, 0, :]  # CLS token embedding
            
            # Get severity score from classifier (0 to 1)
            raw_score = self.classifier(embeddings).numpy()[0][0]
            
            # Scale to 0-10 range
            severity_score = float(raw_score * 10)
            
            # Enhance with keyword-based score for demo purposes
            keyword_score = self._fallback_scoring(text)
            
            # Combined score (in a real implementation, this would be the model's output)
            final_score = (severity_score * 0.7) + (keyword_score * 0.3)
            
            logger.info(f"Text analysis complete. Severity score: {final_score:.2f}")
            return final_score
            
        except Exception as e:
            logger.error(f"Error in text analysis: {str(e)}")
            # Fall back to keyword-based scoring on error
            return self._fallback_scoring(text)
    
    def _preprocess_text(self, text: str) -> str:
        """
        Clean and preprocess text for analysis
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _fallback_scoring(self, text: str) -> float:
        """
        Fallback method using keyword matching when the model isn't available
        
        Args:
            text: Preprocessed text
            
        Returns:
            Severity score from 0 to 10
        """
        # Count keyword occurrences with weights
        high_count = sum(1 for word in self.violence_keywords['high'] if word in text)
        medium_count = sum(1 for word in self.violence_keywords['medium'] if word in text)
        low_count = sum(1 for word in self.violence_keywords['low'] if word in text)
        
        # Apply weights
        score = (high_count * 3) + (medium_count * 1.5) + (low_count * 0.5)
        
        # Scale and cap score
        scaled_score = min(score / 5, 10.0)
        
        logger.info(f"Fallback text analysis complete. Severity score: {scaled_score:.2f}")
        return scaled_score 