import pytest

from integrations.phone import normalize_phone, phones_match


def test_normalize_uk_mobile():
    assert normalize_phone("07911 123456") == "+447911123456"


def test_normalize_already_e164():
    assert normalize_phone("+447911123456") == "+447911123456"


def test_normalize_international_prefix():
    assert normalize_phone("00447911123456") == "+447911123456"


def test_normalize_invalid_short():
    assert normalize_phone("12345") is None


def test_phones_match():
    assert phones_match("+447911123456", "07911 123456")
    assert not phones_match("+447911123456", "+12025550199")
