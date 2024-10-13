from flask import Flask, render_template, request, jsonify
from openpyxl import load_workbook
from collections import Counter
import os

app = Flask(__name__)

def find_duplicates(file_path):
    workbook = load_workbook(filename=file_path, read_only=True)
    sheet = workbook.active
    
    # Assuming the data is in the first column
    column_data = [cell.value for cell in sheet['A'][1:] if cell.value]
    
    # Find duplicates
    duplicates = [item for item, count in Counter(column_data).items() if count > 1]
    
    return duplicates

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
    
    if file and file.filename.endswith(('.xlsx', '.xls')):
        try:
            file_path = os.path.join('uploads', file.filename)
            file.save(file_path)
            duplicates = find_duplicates(file_path)
            os.remove(file_path)  # Remove the file after processing
            
            if duplicates:
                return jsonify({'duplicates': duplicates})
            else:
                return jsonify({'message': 'No se encontraron duplicados'})
        except Exception as e:
            return jsonify({'error': f'Error al procesar el archivo: {str(e)}'}), 500
    else:
        return jsonify({'error': 'Tipo de archivo no válido. Por favor, sube un archivo Excel (.xlsx o .xls)'}), 400

if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    app.run(debug=True)