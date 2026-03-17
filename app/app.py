from flask import Flask, jsonify

app = Flask(__name__)

ITEMS = [
    {"id": 1, "name": "item-one"},
    {"id": 2, "name": "item-two"},
    {"id": 3, "name": "item-three"},
]


@app.route("/")
def index():
    return jsonify({"message": "Hello from Flask DevOps App!", "version": "1.0"})


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/items")
def items():
    return jsonify({"items": ITEMS})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
