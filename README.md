# @adaptive-ds/pandoc - The Missing Document Converter API

Every developer has been there: you need to convert a Word doc to Markdown, a PDF to HTML, or generate a nicely formatted PDF from your app. You spin up a server, install Pandoc, write a wrapper script, and suddenly you're maintaining infrastructure just to transform documents.

**Stop building document conversion infrastructure.**

This is a hosted Pandoc API that handles the heavy lifting—so you can focus on your actual product.

- **Simple setup** – Deploy once, convert documents via a clean REST API.
- **Format agnostic** – Convert between Markdown, HTML, PDF, DOCX, LaTeX, and 40+ other formats.
- **Fast & reliable** – Runs on Bun's high-performance runtime.
- **API-first** – Simple REST endpoints with full OpenAPI documentation.

Convert documents like you would call any other API. No Pandoc installation required.

Quick Links

- code - https://github.com/david1gp/pandoc
- npm - https://www.npmjs.com/package/@adaptive-ds/pandoc
- pandoc manual - https://pandoc.org/MANUAL.html
- pandoc web - https://pandoc.org/app/

## Features

- Convert documents between 40+ formats (Markdown, HTML, PDF, DOCX, LaTeX, EPUB, etc.)
- Two conversion methods:
  - **From URL** – Provide a publicly accessible file URL
  - **From File** – Send base64-encoded file content directly
- Full OpenAPI/Swagger documentation built-in
- Type-safe client libraries for easy integration

## Architecture

The service runs on Bun, a fast JavaScript runtime:

```
Your App → Bun Server → Pandoc Engine → Converted Output → Your App
```

## Prerequisites

- Bun runtime installed
- Pandoc installed on the host machine
- A VPS or server to host the service

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   bun install
   ```

3. Run the development server:
   ```
   bun run dev
   ```

4. Visit `http://localhost:3000` for the Swagger UI

## Usage

### Convert from URL

```bash
curl -X POST "http://localhost:3000/api/pandoc/from-url" \
  -H "Content-Type: application/json" \
  -d '{
    "inputUrl": "https://example.com/document.docx",
    "inputFormat": "docx",
    "outputFormat": "markdown"
  }'
```

### Convert from File

```bash
curl -X PUT "http://localhost:3000/api/pandoc/from-file" \
  -H "Content-Type: application/json" \
  -d '{
    "fileBase64": "$(base64 -w0 document.docx)",
    "inputFormat": "docx",
    "outputFormat": "markdown"
  }'
```

## Supported Formats

### Input Formats
docx, odt, rtf, epub, pdf, html, json, markdown, asciidoc, and more

### Output Formats
markdown, html, pdf, docx, odt, latex, beamer, epub, asciidoc, and more

See the [Pandoc manual](https://pandoc.org/MANUAL.html) for the full list of supported formats.

## Deployment

1. **Install dependencies**:
   ```
   bun install
   ```

2. **Ensure Pandoc and TeX Live are installed** on your server:
   ```
   pandoc --version
   ```
   
   TeX Live is required for PDF output. Install via your package manager:
   - Ubuntu/Debian: `apt install texlive-latex-base`
   - Fedora/RHEL: `dnf install texlive-latex-base`
   - macOS: `brew install --cask mactex` or `texlive-latex-base`
   - Arch: `pacman -S texlive-core`

3. **Run in production**:
   ```
   bun run start
   ```

4. **Use a process manager** (systemd, PM2, etc.) to keep it running:

## Security Considerations

- Input validation on all endpoints
- No sensitive data is logged or exposed
- Rate limiting recommended at the proxy/load balancer level
- Base64 input prevents direct file system access

## License

MIT License - use it freely in your projects!
