from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text()
ENTER = (ROOT / "enter.html").read_text()
JAVASCRIPT = (ROOT / "landing.js").read_text()
CSS = (ROOT / "landing.css").read_text()


def test_entry_click_starts_the_curtain_before_waiting_for_media_completion() -> None:
    transition = JAVASCRIPT[JAVASCRIPT.index("const unlockEntryTransition"):]
    assert transition.index('document.body.classList.add("is-leaving")') < transition.index(
        'latticeVideo.addEventListener("ended"'
    )
    assert "--entry-transition-ms" in JAVASCRIPT
    assert "--entry-copy-transition-ms" in JAVASCRIPT
    assert "remainingMs + 120" in JAVASCRIPT
    assert "}, 620);" not in JAVASCRIPT[JAVASCRIPT.index("const finishEntryTransition"):JAVASCRIPT.index("const unlockEntryTransition")]


def test_entry_sound_uses_a_transition_crescendo_and_natural_end() -> None:
    assert "const entryPeakVolume = 0.86" in JAVASCRIPT
    assert "entryTransitionStartMediaTime" in JAVASCRIPT
    assert "entryTransitionStartVolume" in JAVASCRIPT
    assert "const crescendo = 1 - Math.pow(1 - transitionProgress, 2.2)" in JAVASCRIPT
    assert 'latticeVideo.addEventListener("ended", () => finishEntryTransition(target)' in JAVASCRIPT
    assert "entryTransitionEarliestFinish" in JAVASCRIPT


def test_entry_visuals_keep_the_accepted_lattice_and_timed_swipe() -> None:
    assert "assets/rfl-entry-lattice-loop.mp4" in INDEX
    assert "assets/rfl-entry-lattice-object-clean-loop.mp4" in INDEX
    assert "entry-final-flash" in JAVASCRIPT
    assert ".entry-final-flash .entry-lattice-object" in CSS
    assert "transform var(--entry-transition-ms, 700ms)" in CSS


def test_entry_pages_share_the_new_cache_busted_assets() -> None:
    for html in (INDEX, ENTER):
        assert "landing.css?rev=first-party-intake-1" in html
        assert "landing.js?rev=first-party-intake-1" in html


def test_gateway_booking_routes_through_the_shared_enterprise_intake() -> None:
    assert ENTER.count('href="enterprise.html#message-us"') == 1
    assert 'href="calendar/"' not in ENTER
