from flask import Flask, jsonify
from flask_cors import CORS
from config import config, Config
from routes.crimes import crimes_bp
from routes.analytics import analytics_bp
from routes.predictions import predictions_bp
from routes.patrol_routes import patrol_bp
import os

def create_app(config_name='development'):
    """Application factory"""
    
    app = Flask(__name__)
    
    # Load config
    app.config.from_object(config[config_name])
    
    # Enable CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    app.register_blueprint(crimes_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(predictions_bp)
    app.register_blueprint(patrol_bp)
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Trinetra AI Backend is running'
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Resource not found',
            'status': 404
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Internal server error',
            'error': str(error),
            'status': 500
        }), 500
    
    return app

if __name__ == '__main__':
    env = os.getenv('FLASK_ENV', 'development')
    app = create_app(env)
    app.run(
        host=os.getenv('HOST', '0.0.0.0'),
        port=int(os.getenv('PORT', 5000)),
        debug=(env == 'development')
    )
