import json
import os
import sys

# Ensure backend path is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.analyzer import analyze_text


def run_evaluation():
    corpus_path = os.path.join(os.path.dirname(__file__), "..", "data", "corpus.json")
    if not os.path.exists(corpus_path):
        print(f"Error: Corpus no encontrado en {corpus_path}")
        return

    with open(corpus_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    test_cases = data.get("test_cases", [])
    print(f"=== Evaluando corpus de SentinelText ({len(test_cases)} casos) ===")

    tp = 0
    fp = 0
    fn = 0
    total_cases = len(test_cases)
    passed = 0

    for case in test_cases:
        case_id = case["id"]
        text = case["text"]
        expected_rules = set(case["expected_rules"])

        result = analyze_text(text)
        detected_rules = set(m.rule_id for m in result.matches)

        # Check rule match correctness
        # For simplicity in evaluation: rule detection match
        is_correct = expected_rules.issubset(detected_rules) or (not expected_rules and not detected_rules)
        
        if is_correct:
            passed += 1
            print(f"[{case_id}] OK - Esperadas: {expected_rules}, Detectadas: {detected_rules}")
        else:
            print(f"[{case_id}] FALLO - Esperadas: {expected_rules}, Detectadas: {detected_rules} | Texto: '{text}'")

    accuracy = (passed / total_cases) * 100 if total_cases > 0 else 0
    print("\n====================")
    print(f"Casos evaluados: {total_cases}")
    print(f"Casos correctos: {passed}")
    print(f"Exactitud (Accuracy): {accuracy:.2f}%")
    print("====================")


if __name__ == "__main__":
    run_evaluation()
