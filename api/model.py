from flask import Blueprint, jsonify, make_response, request
import joblib
import pandas as pd

model = Blueprint('model', __name__)

@model.route('/model', methods=["GET", "POST"])
def model_req():
        model_filename = 'lgb_cz2006.pkl'
        model_path = f"models/{model_filename}"


        gbm_pickle = joblib.load(model_path)
        res = pd.DataFrame(columns=['town', 'flat_type']) 
        try:
            town = request.args.get('town')
            data = request.get_json()
            town = data['town']
            flat_type = data['flat_type']
            res.loc[0] = [town,flat_type]
            for c in res.columns:
                res[c] = res[c].astype('category')
            pred = gbm_pickle.predict(res)[0]
            res_dict = {'pred':round(pred, 2)}
            # return str(pred)
            return jsonify({"listing": res_dict})
        except:
             return """
        <!DOCTYPE html>
        <html>
        <head><title>Hello</title></head>
        <body><h1>Error with model inputs</h1></body>
        </html>
        """, 200