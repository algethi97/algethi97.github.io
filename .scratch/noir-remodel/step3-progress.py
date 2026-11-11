import json
import os
import pathlib
import sys

path = pathlib.Path(
    r"C:\Projects\algethi97.github.io\adk\chat\runtime\7ab2b3d3dc94a0561e64"
    r"\77949678abb44126af0bd332ea08ef1f\plan-progress.json"
)
temporary = path.with_suffix(".tmp")
if temporary.exists():
    os.replace(temporary, path)
if path.exists():
    progress = json.loads(path.read_text(encoding="utf-8"))
else:
    path.parent.mkdir(parents=True, exist_ok=True)
    progress = {
        "proposal_id": "d166fd306df445ecb5498f62242ab7df",
        "request_id": "77949678abb44126af0bd332ea08ef1f",
        "run_id": "3438556f623746b3874a275a8a403f26",
        "approval_id": "6ae9ba549d474185bbb1b3b5d629d66b",
        "execution_plan_hash": "8ae29f8f22f5507dd3a84082841a88c56cc3bd9d8e45e81d04ac5b7339c26a2c",
        "format_version": 1,
        "sequence": 0,
        "steps": [{"key": "3", "state": "pending", "note": "", "checks": []}],
        "issues": [],
    }
progress["sequence"] += 1
progress["steps"][0].update(state=sys.argv[1], note=sys.argv[2])
if sys.argv[1] == "blocked":
    progress["issues"] = [{"key": "focus-measurement-approval", "text": sys.argv[2]}]
if sys.argv[1] == "reported":
    states = json.loads(pathlib.Path(".scratch/noir-remodel/step3-states-results.json").read_text(encoding="utf-8"))
    total = len(states["rows"])
    passed = sum(row["passed"] is True for row in states["rows"])
    progress["steps"][0]["checks"] = [
        {"name": "기존 테스트", "passed": True, "detail": "node --test tests/static-site.test.mjs의 9개 테스트가 통과했습니다."},
        {"name": "변경 후 Chrome 검증", "passed": True, "detail": "1440×900·390×844 캡처와 가로 넘침·보드 스타일 보존·CSS 구문·대비 등 22개 검사가 통과했습니다."},
        {"name": "ADesk 최종 검증", "passed": True, "detail": "앱 지정 verify_changes.py 검증이 종료 코드 0으로 통과했습니다."},
        {"name": "추가 상태 검증", "passed": states["passed"], "detail": f"승인된 포커스 검사 수정 후 {total}개 중 {passed}개가 통과했습니다."},
    ]
    if states["passed"]:
        progress["issues"] = []
temporary.write_text(json.dumps(progress, ensure_ascii=False, indent=2), encoding="utf-8")
os.replace(temporary, path)
print(json.dumps({"sequence": progress["sequence"], "step": "3", "state": sys.argv[1]}, ensure_ascii=False))
