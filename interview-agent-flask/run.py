# from app import create_app
from flask import Flask
from flask_cors import CORS
from app.practice_route import practice_bp
from app.interview_route import interview_bp
import os
import glob


def delete_files_in_folder(folder_path):
    files = glob.glob(os.path.join(folder_path, '*'))
    for f in files:
        if os.path.isfile(f):
            os.remove(f)

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.register_blueprint(practice_bp, url_prefix='/practice')
    app.register_blueprint(interview_bp, url_prefix='/interview')
    

    delete_files_in_folder('resource/stream')
    delete_files_in_folder('resource/face_image')
    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True)