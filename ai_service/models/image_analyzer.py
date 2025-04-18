import os
import logging
import numpy as np
from typing import List, Dict, Any, Optional, Union
import json

# Initialize conditional imports to handle when libraries aren't available
try:
    import cv2
    from PIL import Image
    from ultralytics import YOLO
    MODELS_AVAILABLE = True
except ImportError:
    MODELS_AVAILABLE = False
    logging.warning("OpenCV/Ultralytics not available, ImageAnalyzer will use fallback mode")

logger = logging.getLogger(__name__)

class ImageAnalyzer:
    """
    Image analysis model for violence detection and severity scoring
    using YOLOv8 for object detection and scene classification.
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the image analyzer
        
        Args:
            model_path: Path to YOLOv8 model file
        """
        self.model_loaded = False
        self.model = None
        
        # Violence-related objects for detection
        self.violence_objects = {
            'high': [
                'knife', 'gun', 'rifle', 'pistol', 'weapon', 'blood', 'fire',
                'explosion'
            ],
            'medium': [
                'baseball bat', 'bottle', 'stick', 'chain', 'crowbar', 'hammer',
                'wrench', 'scissors', 'rock'
            ],
            'low': [
                'person', 'car', 'truck', 'motorcycle', 'bicycle', 'dog'
            ]
        }
        
        # Try to load the model if available
        if MODELS_AVAILABLE:
            self._load_model(model_path)
    
    def _load_model(self, model_path: Optional[str] = None) -> None:
        """
        Load the YOLOv8 model
        
        In a real implementation, this would load a fine-tuned model.
        For this demo, we'll use the pretrained YOLOv8 model.
        """
        try:
            # Use default model path if not provided
            if model_path is None:
                model_path = os.environ.get('MODEL_PATH', os.path.join(os.path.dirname(__file__), '../models'))
            
            # In a real implementation, you would load a specific model file
            # For demo, we're using the standard YOLOv8n model
            self.model = YOLO('yolov8n.pt')
            
            logger.info("ImageAnalyzer model loaded successfully")
            self.model_loaded = True
            
        except Exception as e:
            logger.error(f"Error loading ImageAnalyzer model: {str(e)}")
            self.model_loaded = False
    
    def is_loaded(self) -> bool:
        """Check if the model is loaded"""
        return self.model_loaded
    
    def analyze(self, image_path: str) -> float:
        """
        Analyze a single image for violence severity
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Severity score from 0 to 10
        """
        if not os.path.exists(image_path):
            logger.error(f"Image file not found: {image_path}")
            return 0.0
            
        # If model is not available, use simulated scoring
        if not self.model_loaded or not MODELS_AVAILABLE:
            return self._fallback_scoring(image_path)
        
        try:
            # Run YOLOv8 inference
            results = self.model(image_path)
            
            # Get detected objects
            detected_objects = []
            for result in results:
                # Extract class names and confidence scores
                for i, (cls, conf) in enumerate(zip(result.boxes.cls.cpu().numpy(), 
                                                   result.boxes.conf.cpu().numpy())):
                    class_name = result.names[int(cls)]
                    confidence = float(conf)
                    detected_objects.append({
                        'class': class_name,
                        'confidence': confidence
                    })
            
            # Calculate severity based on detected objects
            severity_score = self._calculate_severity(detected_objects)
            
            logger.info(f"Image analysis complete. Severity score: {severity_score:.2f}")
            return severity_score
            
        except Exception as e:
            logger.error(f"Error in image analysis: {str(e)}")
            # Fallback to simulated scoring on error
            return self._fallback_scoring(image_path)
    
    def analyze_batch(self, image_paths: List[str]) -> float:
        """
        Analyze multiple images and return an aggregate severity score
        
        Args:
            image_paths: List of paths to image files
            
        Returns:
            Aggregate severity score from 0 to 10
        """
        if not image_paths:
            return 0.0
        
        # Process each image
        scores = []
        for image_path in image_paths:
            score = self.analyze(image_path)
            scores.append(score)
        
        # Return the maximum score as the aggregate
        # In a real implementation, you might use a weighted average or other method
        if scores:
            max_score = max(scores)
            logger.info(f"Batch image analysis complete. Max severity score: {max_score:.2f}")
            return max_score
        
        return 0.0
    
    def _calculate_severity(self, detected_objects: List[Dict[str, Any]]) -> float:
        """
        Calculate severity score based on detected objects
        
        Args:
            detected_objects: List of detected objects with class and confidence
            
        Returns:
            Severity score from 0 to 10
        """
        if not detected_objects:
            return 0.0
        
        # Initialize scores for each severity level
        high_score = 0.0
        medium_score = 0.0
        low_score = 0.0
        
        # Categorize detected objects by severity
        for obj in detected_objects:
            class_name = obj['class'].lower()
            confidence = obj['confidence']
            
            # Check if class name matches or contains any of our violence objects
            for high_obj in self.violence_objects['high']:
                if high_obj in class_name:
                    high_score += confidence
                    break
                    
            for medium_obj in self.violence_objects['medium']:
                if medium_obj in class_name:
                    medium_score += confidence
                    break
                    
            for low_obj in self.violence_objects['low']:
                if low_obj in class_name:
                    low_score += confidence
                    break
        
        # Apply weights to each severity level
        weighted_score = (high_score * 5.0) + (medium_score * 2.5) + (low_score * 1.0)
        
        # Normalize and cap score
        normalized_score = min(weighted_score * 2.0, 10.0)
        
        return normalized_score
    
    def _fallback_scoring(self, image_path: str) -> float:
        """
        Fallback method for generating a simulated score when the model isn't available
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Simulated severity score from 0 to 10
        """
        try:
            # Use basic properties like image size and color distribution
            # to generate a simulated score
            img = None
            if MODELS_AVAILABLE:
                img = cv2.imread(image_path)
                if img is None:
                    # Try with PIL if OpenCV fails
                    img = np.array(Image.open(image_path))
            
            if img is not None:
                # Use the image statistics to generate a pseudo-random score
                # This is just for demonstration - not actually meaningful
                height, width = img.shape[:2]
                size_factor = min((height * width) / (1000 * 1000), 1.0)
                
                # Calculate color intensity metrics
                if len(img.shape) == 3:  # Color image
                    # Look at red channel intensity as a naive proxy for blood/violence
                    red_channel = img[:, :, 2] if img.shape[2] >= 3 else img[:, :, 0]
                    red_intensity = np.mean(red_channel) / 255.0
                    
                    # Generate score based on size and red intensity
                    simulated_score = (size_factor * 3.0) + (red_intensity * 7.0)
                else:  # Grayscale image
                    intensity = np.mean(img) / 255.0
                    simulated_score = (size_factor * 3.0) + (intensity * 5.0)
                
                # Cap the score
                return min(simulated_score, 10.0)
            
            # If we couldn't open the image, return a low random score
            return np.random.uniform(0.5, 3.0)
            
        except Exception as e:
            logger.error(f"Error in fallback image scoring: {str(e)}")
            # Return a low random score on error
            return np.random.uniform(0.5, 3.0) 