from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from generator import *
import glob
import random

app = Flask(__name__)
CORS(app)


# @app.route('/process_text', methods=['POST'])
# def process_text():
#     data = request.json
#     text = data['text']
#     response = {'message': 'Text processed', 'data': text}
#     return jsonify(response)

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = './'


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/sample')
def sample():
    return {"message": "hi"}

@app.route('/process_summary', methods=['POST'])
def process_summary():
    print("Processing summary...")
    cleaner()
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400

    files = request.files.getlist('file')
    topic = request.form['topic']
    
    # only keeping valid files
    valid_files = [file for file in files if allowed_file(file.filename)]

    # if no valid files
    if not valid_files:
        return jsonify({"message": "No valid files provided"}), 400
    
    # Process all files together
    converter(files, topic, app)
    
    combined_results = {}
    
    with open('./summary.json', 'r') as out:
        data = json.load(out)
        combined_results.update(data)

    new_json_content = {'Summary': combined_results}
    with open('final.json', 'w') as json_file:
        json.dump(combined_results, json_file, indent=4)
    return jsonify(new_json_content)

@app.route('/process_quiz', methods=['GET'])
def process_quiz():
    try:
        amt = request.args.get('amt', default=5, type=int)
        tp = request.args.get('topic', default=None, type=str)

        if not tp:
            return jsonify({"error": "Topic parameter is required."}), 400

        print(f"Received amt: {amt}, topic: {tp}")  # Debugging output

        generate_quiz(tp, amt)
        with open('./quiz.json', 'r') as out:
            data = json.load(out)

        return jsonify({'Questions': data})
    except Exception as e:
        print(f"Error processing quiz: {e}")  # Debugging output
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
