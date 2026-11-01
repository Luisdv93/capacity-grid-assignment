"""Check the running API against independent, daily sums of the fixed seed."""
import argparse
import json
from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal, getcontext
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

getcontext().prec = 80


def call(base, path, body=None):
    payload = None if body is None else json.dumps(body).encode()
    request = Request(base + path, data=payload, method="GET" if body is None else "PATCH",
                      headers={"Content-Type": "application/json"})
    with urlopen(request, timeout=30) as response:
        return json.load(response, parse_float=Decimal)


def seed_rows(table):
    active = False
    seed = Path(__file__).resolve().parents[1] / "db/seed.sql"
    with seed.open() as source:
        for line in source:
            if line.startswith("COPY "):
                active = line.split()[1] == "public." + table
            elif line.strip() == "\\.":
                active = False
            elif active:
                yield line.rstrip("\n").split("\t")


def verify(base, start, end):
    result = call(base, "/api/capacity?" + urlencode({"from": start, "to": end}))
    first, last = date.fromisoformat(result["from"]), date.fromisoformat(result["to"])
    expected_first = date.fromisoformat(start)
    expected_first -= timedelta(days=expected_first.weekday())
    expected_last = date.fromisoformat(end)
    expected_last += timedelta(days=6 - expected_last.weekday())
    assert (first, last) == (expected_first, expected_last)
    weeks = [first + timedelta(days=7 * i) for i in range((last - first).days // 7 + 1)]
    assert result["weeks"] == [week.isoformat() for week in weeks]
    totals = defaultdict(Decimal)
    for _, person_id, _, begins, ends, hours in seed_rows("assignments"):
        day = max(first, date.fromisoformat(begins))
        stop = min(last, date.fromisoformat(ends))
        daily = Decimal(hours)
        while day <= stop:
            if day.weekday() < 5:
                monday = day - timedelta(days=day.weekday())
                totals[int(person_id), monday] += daily
            day += timedelta(days=1)
    people = {int(row[0]): row for row in seed_rows("people")}
    assert len(result["people"]) == len(people)
    assert {person["id"] for person in result["people"]} == set(people)
    for person in result["people"]:
        expected = [totals[person["id"], week] for week in weeks]
        assert person["allocatedHours"] == expected, (person["id"], person["allocatedHours"], expected)
        assert person["name"] == people[person["id"]][1]
    print(f"PASS: {len(people)} people × {len(weeks)} weeks; daily seed sums match every API cell.")
    return result


def verify_edit(base):
    path = "/api/capacity?from=2026-01-05&to=2026-01-09"
    person = next(p for p in call(base, path)["people"] if p["id"] == 5)
    original = person["weeklyHours"]
    try:
        saved = call(base, "/api/people/5", {"weeklyHours": 32.5})
        assert saved["weeklyHours"] == Decimal("32.5")
        updated = next(p for p in call(base, path)["people"] if p["id"] == 5)
        assert updated["weeklyHours"] == Decimal("32.5")
        assert updated["allocatedHours"] == person["allocatedHours"]
        for body in ({"weeklyHours": -1}, {"weeklyHours": "40"}, {"weeklyHours": None}, {}):
            try:
                call(base, "/api/people/5", body)
                raise AssertionError(f"invalid body accepted: {body}")
            except HTTPError as error:
                assert error.code == 400
        try:
            call(base, "/api/people/2147483647", {"weeklyHours": 40})
            raise AssertionError("missing person accepted")
        except HTTPError as error:
            assert error.code == 404
        print("PASS: fractional edit persists, assigned hours stay fixed, invalid inputs rejected, missing person returns 404.")
    finally:
        call(base, "/api/people/5", {"weeklyHours": float(original)})
        restored = next(p for p in call(base, path)["people"] if p["id"] == 5)
        assert restored["weeklyHours"] == original
        print("RESTORED: original weekly capacity for person 5.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://localhost:8080")
    parser.add_argument("--exercise-edit", action="store_true", help="temporarily edit person 5 and restore their original hours")
    args = parser.parse_args()
    verify(args.base_url, "2025-12-29", "2026-01-16")
    verify(args.base_url, "2026-01-07", "2026-01-09")
    verify(args.base_url, "2025-01-01", "2027-01-01")
    if args.exercise_edit:
        verify_edit(args.base_url)
