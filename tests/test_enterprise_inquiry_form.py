from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "enterprise.html").read_text()
JAVASCRIPT = (ROOT / "landing.js").read_text()
CSS = (ROOT / "landing.css").read_text()


def test_enterprise_inquiry_keeps_the_visible_form_lean_and_consent_bound() -> None:
    for name in (
        "name",
        "business_name",
        "email",
        "phone",
        "preferred_reply",
        "message",
        "contact_consent",
    ):
        assert f'name="{name}"' in HTML
    assert 'name="contact_consent" type="hidden" value="yes"' in HTML
    assert 'name="contact_consent" type="checkbox"' not in HTML
    assert "permission to contact me about this inquiry" not in HTML
    assert "Submitting this inquiry asks Renaissance Field Lite to reply through your selected channel" in HTML
    assert "No marketing list. One confirmation is sent through your selected channel" in HTML
    assert 'name="_gotcha"' in HTML
    assert 'name="submission_id"' in HTML
    assert 'name="submitted_at"' in HTML
    assert 'name="rfl_payload"' not in HTML
    assert 'name="subject"' not in HTML


def test_enterprise_inquiry_is_fail_closed_until_the_first_party_endpoint_is_approved() -> None:
    assert 'data-inquiry-endpoint=""' in HTML
    assert '<button type="submit" disabled>Send private inquiry</button>' in HTML
    assert 'candidate.hostname === "intake.renaissancefieldlite.com"' in JAVASCRIPT
    assert 'candidate.pathname === "/v1/inquiries"' in JAVASCRIPT
    assert 'candidate.href === approvedEndpoint' in JAVASCRIPT
    assert 'candidate.protocol === "https:"' in JAVASCRIPT
    assert 'schema: "rfl-website-inquiry-v1"' in JAVASCRIPT
    assert "fetch(endpoint" in JAVASCRIPT
    assert '"Content-Type": "application/json"' in JAVASCRIPT
    assert "body: JSON.stringify(payload)" in JAVASCRIPT
    assert "const inquiryReceipt = (payload, receipt = {})" in JAVASCRIPT
    assert "receipt.acknowledgement_channel" in JAVASCRIPT
    assert "receipt.acknowledgement_state" in JAVASCRIPT
    assert "sent your confirmation by ${method}" in JAVASCRIPT
    assert "(719) 200-3618" in JAVASCRIPT
    assert '>Voice call</option>' in HTML
    assert 'data-enterprise-booking' in HTML
    assert 'hidden' in HTML
    assert 'https://cal.com/dean-patterson-xraeye' in JAVASCRIPT
    assert 'acknowledgementState === "booking_ready"' in JAVASCRIPT
    assert 'receipt.booking_url' in JAVASCRIPT
    assert 'Cal Video' in JAVASCRIPT
    assert 'callback_pending' not in JAVASCRIPT
    assert 'separate team line' not in JAVASCRIPT
    assert "text-only line" in JAVASCRIPT
    assert "response.status === 429" in JAVASCRIPT
    assert "Please wait a few minutes and try again" in JAVASCRIPT
    assert "formspree" not in HTML.lower()
    assert "formspree" not in JAVASCRIPT.lower()
    assert "10067" not in HTML
    assert "127.0.0.1" not in HTML
    assert "10067" not in JAVASCRIPT
    assert "127.0.0.1" not in JAVASCRIPT


def test_enterprise_booking_and_message_us_share_one_tailored_form() -> None:
    assert HTML.count('href="#message-us"') == 2
    assert 'href="calendar/"' not in HTML
    assert '>Voice call</option>' in HTML
    assert 'data-enterprise-booking' in HTML
    assert 'https://cal.com/dean-patterson-xraeye' in JAVASCRIPT


def test_enterprise_uses_text_message_wording_and_direct_text_link() -> None:
    assert '<option value="text">Text message</option>' in HTML
    assert 'Prefer email?' in HTML
    assert (
        'href="mailto:info@renaissancefieldlite.com?subject=Enterprise%20AI%20inquiry"'
        in HTML
    )
    assert '>Email us directly at info@renaissancefieldlite.com.</a>' in HTML
    assert 'Prefer text message?' in HTML
    assert 'href="sms:+17192003618"' in HTML
    assert '>Text us directly.</a>' in HTML
    assert 'If no text app opens, use (719) 200-3618.' in HTML
    assert 'Prefer SMS?' not in HTML


def test_enterprise_inquiry_preserves_the_high_end_responsive_layout() -> None:
    for selector in (
        ".enterprise-inquiry",
        ".enterprise-inquiry-form",
        ".enterprise-inquiry-grid",
        ".enterprise-inquiry-submit",
        ".enterprise-inquiry-booking",
        ".enterprise-inquiry-honeypot",
    ):
        assert selector in CSS
    assert ".enterprise-inquiry-consent" not in CSS
    assert "@media (max-width: 760px)" in CSS
