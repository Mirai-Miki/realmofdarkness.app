"""
Test runner for Haven app tests.

This script runs all Haven app tests and provides comprehensive coverage
of API endpoints, CharacterManager, and serializers.
"""

import sys
import os
from django.test.utils import get_runner
from django.conf import settings

# Add the backend directory to the path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Configure Django settings for testing
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rod.settings")

import django

django.setup()


def run_haven_tests():
    """Run all Haven app tests."""
    # Use Django's test runner
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=False, keepdb=False)

    # Run only Haven app tests
    test_labels = ["haven.tests"]

    failures = test_runner.run_tests(test_labels)

    if failures:
        print(f"\n❌ {failures} test(s) failed")
        return 1
    else:
        print("\n✅ All tests passed!")
        return 0


if __name__ == "__main__":
    exit_code = run_haven_tests()
    sys.exit(exit_code)
