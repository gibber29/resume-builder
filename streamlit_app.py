from __future__ import annotations

import base64
import mimetypes
import re
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


ROOT_DIR = Path(__file__).resolve().parent
DIST_DIR = ROOT_DIR / "dist"
PUBLIC_DIR = ROOT_DIR / "public"


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _to_data_uri(path: Path) -> str:
    mime_type, _ = mimetypes.guess_type(path.name)
    mime_type = mime_type or "application/octet-stream"
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


def _inline_public_assets(content: str) -> str:
    if not PUBLIC_DIR.exists():
        return content

    for asset_path in PUBLIC_DIR.rglob("*"):
        if not asset_path.is_file():
            continue
        relative_path = asset_path.relative_to(PUBLIC_DIR).as_posix()
        content = content.replace(f"/{relative_path}", _to_data_uri(asset_path))

    return content


def _build_embedded_html() -> str:
    index_path = DIST_DIR / "index.html"
    if not index_path.exists():
        raise FileNotFoundError("dist/index.html was not found. Build the Vite app before deploying to Streamlit.")

    index_html = _read_text(index_path)

    script_match = re.search(r'<script[^>]+src="([^"]+)"', index_html)
    style_match = re.search(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"', index_html)

    if not script_match or not style_match:
        raise ValueError("Could not find the built JS/CSS asset references in dist/index.html.")

    script_path = DIST_DIR / script_match.group(1).lstrip("/")
    style_path = DIST_DIR / style_match.group(1).lstrip("/")

    app_js = _inline_public_assets(_read_text(script_path))
    app_css = _inline_public_assets(_read_text(style_path))

    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Smart Resume Builder</title>
    <style>
      html, body, #root {{
        margin: 0;
        padding: 0;
        min-height: 100%;
      }}

      body {{
        overflow-x: hidden;
      }}
    </style>
    <style>{app_css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">{app_js}</script>
  </body>
</html>
"""


st.set_page_config(page_title="Smart Resume Builder", page_icon=":page_facing_up:", layout="wide")

st.markdown(
    """
    <style>
      .block-container {
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;
        padding-left: 0.75rem;
        padding-right: 0.75rem;
        max-width: 100%;
      }

      iframe[title="streamlit_html"] {
        border: 0;
        width: 100%;
      }
    </style>
    """,
    unsafe_allow_html=True,
)

try:
    embedded_html = _build_embedded_html()
except Exception as error:
    st.error(f"Unable to load the embedded frontend build: {error}")
    st.stop()

components.html(embedded_html, height=2200, scrolling=True)
