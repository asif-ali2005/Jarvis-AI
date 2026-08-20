from flask import Flask, request, jsonify, render_template
import main

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/command", methods=["POST"])
def command():
    data = request.get_json()
    command_text = data.get("command", "")
    
    if not command_text:
        return jsonify({"error": "No command provided"}), 400
        
    response_text, action = main.processCommand(command_text)
    
    return jsonify({
        "response": response_text,
        "action": action
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
